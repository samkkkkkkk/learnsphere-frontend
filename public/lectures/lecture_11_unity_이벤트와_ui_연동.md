# 11강. Unity 이벤트와 UI 연동

> **강의 설명**: Awaitable Events, AsyncTriggers, Button 클릭 비동기 처리  
> **생성 일시**: 2025-07-13 19:39:02

---

# Unity 이벤트와 UI 연동: UniTask 활용하기

게임 개발 과정에서 UI와 이벤트 시스템은 사용자 경험을 향상시키는 데 필수적인 요소입니다. 이 강의에서는 Unity의 이벤트 시스템과 UI를 UniTask를 사용하여 비동기로 처리하는 방법을 배워보겠습니다. UniTask는 이를 위한 강력한 기능을 제공하며, 비동기 프로그래밍을 보다 효율적이고 직관적으로 만들어 줍니다.

## 학습 내용

- Unity의 이벤트와 UI 연동 이해하기
- Awaitable Events의 개념과 활용
- AsyncTriggers를 사용한 비동기 이벤트 처리
- Button 클릭 이벤트의 비동기 처리 방법
- 실제 게임 개발에서의 활용 사례

## 실제 개발에서 마주하는 문제들

### 동기식 이벤트 처리의 문제점

게임 개발에서 UI 이벤트를 동기적으로 처리하면 다음과 같은 문제를 경험할 수 있습니다:

```csharp
public class UIManager : MonoBehaviour
{
    public Button myButton;
    
    void Start()
    {
        myButton.onClick.AddListener(OnButtonClick);
    }

    void OnButtonClick()
    {
        // 리소스 로딩 - 블로킹 발생
        var asset = Resources.Load<Sprite>("sprite");
        
        // 장시간 작업 - UI가 멈출 수 있음
        for (int i = 0; i < 1000000; i++)
        {
            // ...
        }

        Debug.Log("Button Clicked");
    }
}
```

이 동기식 코드의 문제점들:
- **UI 멈춤 현상**: 긴 작업이 UI 스레드를 차단하여 사용자 경험을 저하시킬 수 있음
- **복잡한 에러 처리**: 비동기 작업을 관리하기 어렵고, 오류 발생 시 복구가 복잡
- **반응성 저하**: 사용자 인터페이스의 반응성이 떨어짐

## UniTask로 비동기 이벤트 처리하기

### Awaitable Events란 무엇인가?

Awaitable Events는 이벤트를 비동기적으로 처리할 수 있도록 하는 UniTask의 기능입니다. 이를 통해 이벤트가 발생할 때까지 비동기적으로 대기할 수 있습니다.

### AsyncTriggers: 비동기 이벤트 핸들링

AsyncTriggers는 Unity의 MonoBehaviour 메시지 이벤트를 비동기로 처리할 수 있게 해주는 UniTask의 강력한 도구입니다.

```csharp
using Cysharp.Threading.Tasks;
using Cysharp.Threading.Tasks.Triggers;

public class Example : MonoBehaviour
{
    private async UniTaskVoid Start()
    {
        var trigger = this.GetAsyncUpdateTrigger();
        
        await trigger.UpdateAsync();
        Debug.Log("Update triggered asynchronously");
    }
}
```

### Button 클릭 이벤트의 비동기 처리

UI 버튼 클릭을 비동기로 처리하여 UI의 반응성을 높일 수 있습니다.

```csharp
using UnityEngine;
using UnityEngine.UI;
using Cysharp.Threading.Tasks;

public class UIButtonHandler : MonoBehaviour
{
    public Button myButton;

    private void Start()
    {
        myButton.onClick.AddListener(() => OnButtonClickedAsync().Forget());
    }

    private async UniTaskVoid OnButtonClickedAsync()
    {
        // 리소스를 비동기로 로드
        var sprite = await Resources.LoadAsync<Sprite>("sprite");
        
        if (sprite != null)
        {
            Debug.Log("Sprite loaded successfully.");
        }
        
        // 긴 작업을 비동기로 처리
        await UniTask.SwitchToThreadPool();
        
        for (int i = 0; i < 1000000; i++)
        {
            // 긴 작업 처리
        }
        
        await UniTask.SwitchToMainThread();

        Debug.Log("Button Clicked asynchronously");
    }
}
```

이 코드에서는 UniTask를 사용하여 버튼 클릭 시 리소스를 비동기로 로드하고 긴 작업을 별도의 스레드에서 처리하여 UI의 반응성을 유지합니다.

## 실습 과제

### 🎯 과제 1: 비동기 UI 업데이트

다음 요구사항을 만족하는 비동기 UI 업데이트 시스템을 UniTask로 구현하세요:

**요구사항:**
1. 버튼 클릭 시 비동기로 데이터를 로드
2. 로드된 데이터를 UI 텍스트에 업데이트
3. UI 업데이트 완료 후 성공 메시지 출력

**힌트:**

```csharp
public async UniTask LoadDataAndUpdateUIAsync(Text uiText)
{
    // 데이터를 비동기로 로드
    var data = await LoadDataAsync();
    
    // UI 텍스트에 데이터 업데이트
    uiText.text = data;
    
    Debug.Log("UI updated successfully");
}

private async UniTask<string> LoadDataAsync()
{
    // 비동기 데이터 로드 시뮬레이션
    await UniTask.Delay(1000);
    return "Loaded Data";
}
```

### 🎯 과제 2: 비동기 이벤트 시퀀스

Unity의 여러 버튼 클릭 이벤트를 비동기로 순차적으로 처리하는 시스템을 구현하세요.

## ❌ 자주 하는 실수들

### 1. 비동기 작업을 무시

```csharp
// ❌ 잘못된 방법 - 비동기 작업 결과를 무시함
public void StartLongTask()
{
    var task = LongRunningTaskAsync();
}

// ✅ 올바른 방법
public async UniTask StartLongTask()
{
    await LongRunningTaskAsync();
}
```

### 2. CancellationToken 미사용

```csharp
// ❌ 취소 처리 없음
public async UniTask ProcessData()
{
    await UniTask.Delay(10000); // 10초간 취소 불가
}

// ✅ 취소 토큰 사용
public async UniTask ProcessData(CancellationToken ct)
{
    await UniTask.Delay(10000, cancellationToken: ct);
}
```

## ✅ 모범 사례

### 1. UI 비동기 업데이트

```csharp
public async UniTask UpdateUIAsync(Text uiText, CancellationToken ct)
{
    var data = await LoadDataAsync(ct);
    uiText.text = data;
    Debug.Log("UI updated");
}
```

### 2. 비동기 이벤트 핸들링

```csharp
public class AsyncUIHandler : MonoBehaviour
{
    public Button button;

    private void Start()
    {
        button.onClick.AddListener(() => HandleButtonClickAsync().Forget());
    }

    private async UniTaskVoid HandleButtonClickAsync()
    {
        await UniTask.Yield(); // 비동기 처리
        Debug.Log("Button clicked and handled asynchronously");
    }
}
```

## 요약

- **Awaitable Events와 AsyncTriggers**를 통해 Unity의 이벤트를 비동기로 처리할 수 있습니다.
- **UI의 반응성을 유지**하면서 비동기 작업을 수행할 수 있습니다.
- UniTask를 사용하면 **에러 처리와 취소 관리**가 간단해집니다.
- **CancellationToken**을 활용하여 비동기 작업을 안전하게 취소할 수 있습니다.
- **실제 게임 개발 시나리오**에서 UniTask는 UI와 이벤트 처리에 강력한 도구로 자리 잡고 있습니다.

## 🚀 다음 단계

다음 강의에서는 UniTask의 디버깅과 성능 최적화 기법을 살펴보겠습니다. UniTask를 활용한 게임 개발의 성능을 극대화하는 방법을 배웁니다.
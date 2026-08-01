# 9강. async void vs UniTaskVoid

> **강의 설명**: fire-and-forget 패턴, UniTask.Action, MonoBehaviour 생명주기 연동  
> **생성 일시**: 2025-07-13 19:37:39

---

# async void vs UniTaskVoid: 실무에서의 차이점과 활용

Unity 개발에서 비동기 프로그래밍을 활용하는 것은 필수적입니다. 그러나 비동기 메서드를 사용할 때 `async void`와 `UniTaskVoid` 중 어떤 것을 사용해야 할지 혼란스러울 수 있습니다. 이 강의에서는 `async void`와 `UniTaskVoid`의 차이점을 심도 있게 탐구하고, 이를 실무에서 어떻게 활용할 수 있는지에 대해 알아보겠습니다.

## 학습 내용

- `async void`와 `UniTaskVoid`의 기본 개념 이해하기
- `fire-and-forget` 패턴의 실무 적용
- `UniTask.Action`과 Unity 이벤트 시스템 연동
- MonoBehaviour 생명주기와의 통합
- 실무 중심의 게임 개발 예제

## 실제 개발에서 마주하는 문제들

### `async void`의 한계점

많은 개발자들이 비동기 작업을 처리할 때 `async void`를 사용하고 있습니다. 하지만 이는 여러 문제를 일으킬 수 있습니다:

```csharp
// 잘못된 사용 예: 에러 처리가 어려움
public async void OnButtonClick()
{
    await Task.Delay(1000);
    throw new Exception("Something went wrong!");
}
```

이 코드는 다음과 같은 문제를 야기할 수 있습니다:

- **에러 처리의 복잡성**: `async void`에서는 try-catch로 에러를 잡아내기 어렵습니다. 이는 유니티의 `UnobservedTaskException`으로 이어질 수 있습니다.
- **디버깅 어려움**: `async void`의 콜스택은 디버깅이 어려워 문제 해결에 시간을 소모하게 됩니다.
- **예상치 못한 종료**: 메서드가 예기치 않게 종료될 수 있으며, 호출 측에서 이를 알 수 없습니다.

## UniTaskVoid란 무엇인가?

`UniTaskVoid`는 `async void`의 대안으로, UniTask를 기반으로 한 fire-and-forget 비동기 메서드를 작성할 수 있도록 합니다. 이는 다음과 같은 장점이 있습니다:

- **에러 보고**: `UniTaskVoid`는 `UnobservedTaskException`에 에러를 보고하여 문제를 추적할 수 있습니다.
- **명시적 사용**: `Forget()`을 명시적으로 호출하여 의도적인 fire-and-forget임을 나타냅니다.
- **Unity 통합**: Unity의 생명주기와 자연스럽게 통합됩니다.

```csharp
public async UniTaskVoid FireAndForgetMethod()
{
    await UniTask.Yield();
    // 작업 수행
}

public void Caller()
{
    FireAndForgetMethod().Forget();
}
```

### UniTask.Action과 Unity 이벤트 시스템

`UniTask.Action`을 사용하여 Unity 이벤트 시스템과 비동기 메서드를 쉽게 연동할 수 있습니다. 이는 특히 UGUI 이벤트와 함께 사용할 때 유용합니다.

```csharp
using UnityEngine;
using UnityEngine.Events;
using Cysharp.Threading.Tasks;

public class ButtonHandler : MonoBehaviour
{
    public UnityEvent onButtonClick;

    private void Start()
    {
        onButtonClick.AddListener(UniTask.UnityAction(async () =>
        {
            await UniTask.Delay(1000);
            Debug.Log("Button clicked after delay");
        }));
    }
}
```

`UniTask.UnityAction`을 사용하면 `async UniTaskVoid`를 이벤트 리스너로 등록할 수 있습니다. 이는 `async void`를 사용하는 것보다 안전하고 효율적입니다.

## 단계별 해결 과정

### 단계 1: `async void`에서 `UniTaskVoid`로 전환하기

기존의 `async void` 메서드를 `UniTaskVoid`로 전환하는 것은 간단합니다. `Forget()` 메서드를 호출하여 명시적으로 fire-and-forget 작업임을 나타냅니다.

```csharp
public async UniTaskVoid ProcessData()
{
    try
    {
        await UniTask.Delay(500);
        Debug.Log("Processing complete.");
    }
    catch (Exception ex)
    {
        Debug.LogError($"Processing failed: {ex.Message}");
    }
}

public void StartProcess()
{
    ProcessData().Forget();
}
```

### 단계 2: MonoBehaviour 생명주기와 통합

`UniTaskVoid`는 MonoBehaviour의 생명주기 메서드에서도 사용할 수 있습니다. 이를 통해 게임 객체의 파괴 시 자동으로 작업을 취소할 수 있습니다.

```csharp
public class SampleBehaviour : MonoBehaviour
{
    private async UniTaskVoid Start()
    {
        await LongRunningTask(this.GetCancellationTokenOnDestroy());
    }

    private async UniTask LongRunningTask(CancellationToken ct)
    {
        try
        {
            await UniTask.Delay(10000, cancellationToken: ct);
            Debug.Log("Long running task complete.");
        }
        catch (OperationCanceledException)
        {
            Debug.Log("Task was cancelled.");
        }
    }
}
```

### 단계 3: 실무 적용

`UniTaskVoid`를 활용하여 게임 내 다양한 비동기 작업을 관리할 수 있습니다. 예를 들어, 게임 내 이벤트 트리거, UI 업데이트, 리소스 로딩 등에서 유용하게 사용할 수 있습니다.

## 실습 과제

### 🎯 과제 1: UI 이벤트와 UniTaskVoid 연동하기

다음 요구사항을 만족하는 UI 이벤트 시스템을 UniTaskVoid로 구현해보세요:

**요구사항:**
1. 버튼 클릭 시 2초 후 메시지 출력
2. 작업 도중 버튼이 파괴되면 작업 취소
3. 작업 완료 또는 취소 시 로그 메시지 출력

**힌트:**
```csharp
public async UniTaskVoid HandleButtonClick()
{
    try
    {
        await UniTask.Delay(2000, cancellationToken: this.GetCancellationTokenOnDestroy());
        Debug.Log("Button click handled.");
    }
    catch (OperationCanceledException)
    {
        Debug.Log("Button click handling was cancelled.");
    }
}
```

### 🎯 과제 2: 게임 이벤트와 비동기 작업

게임 내 이벤트를 트리거로 비동기 작업을 실행하고, 특정 조건에서 작업을 취소하는 시스템을 구현하세요.

## ❌ 자주 하는 실수들

### 1. Forget 호출하지 않기
```csharp
// ❌ 잘못된 사용
public void StartProcess()
{
    ProcessData(); // Forget을 호출하지 않음
}

// ✅ 올바른 사용
public void StartProcess()
{
    ProcessData().Forget();
}
```

### 2. CancellationToken 사용 누락
```csharp
// ❌ 취소 토큰을 사용하지 않음
public async UniTask LongOperation()
{
    await UniTask.Delay(10000); // 취소 불가
}

// ✅ 취소 토큰 사용
public async UniTask LongOperation(CancellationToken ct)
{
    await UniTask.Delay(10000, cancellationToken: ct);
}
```

## ✅ 모범 사례

### 1. 항상 Forget 호출하기
```csharp
public void ExecuteFireAndForget()
{
    PerformTask().Forget();
}
```

### 2. CancellationToken 활용
```csharp
public async UniTask LoadSceneAsync(CancellationToken ct = default)
{
    try
    {
        await SceneManager.LoadSceneAsync("GameScene").ToUniTask(cancellationToken: ct);
    }
    catch (OperationCanceledException)
    {
        Debug.Log("Scene loading was cancelled.");
    }
}
```

### 3. Unity 이벤트와의 통합
```csharp
public class EventManager : MonoBehaviour
{
    public UnityEvent onEventTrigger;

    private void Awake()
    {
        onEventTrigger.AddListener(UniTask.UnityAction(async () =>
        {
            await UniTask.Delay(1000);
            Debug.Log("Event triggered after delay.");
        }));
    }
}
```

## 요약

- **UniTaskVoid는 `async void`의 안전한 대안**으로, 비동기 fire-and-forget 작업을 관리합니다.
- **Forget()을 사용하여 명시적**으로 작업을 fire-and-forget으로 처리할 수 있습니다.
- **CancellationToken**을 활용하여 작업의 생명주기를 안전하게 관리할 수 있습니다.
- **Unity 이벤트 시스템과 쉽게 통합**되어 게임 개발에 유용합니다.
- **에러를 `UnobservedTaskException`으로 보고**하여 디버깅과 문제 해결에 도움을 줍니다.

## 🚀 다음 단계

다음 강의에서는 UniTask의 고급 기능들을 다뤄보겠습니다:
- **AsyncEnumerable과 스트림**: 비동기 데이터 스트림 처리하기
- **Unity 이벤트와 UI 연동**: 이벤트와 UI를 비동기로 제어하기

이 강의를 통해 `async void`와 `UniTaskVoid`의 차이점을 이해하고, 이를 실무에 적용할 수 있는 방법을 배웠기를 바랍니다. 다음 강의에서는 UniTask의 더 고급 기능을 다루며, 비동기 프로그래밍의 세계로 한 걸음 더 나아가 보겠습니다.
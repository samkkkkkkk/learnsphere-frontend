# 6강. 진행 상황과 피드백

> **강의 설명**: IProgress<T>, Progress.Create, 로딩바 실무 패턴  
> **생성 일시**: 2025-07-13 19:35:08

---

```markdown
# UniTask로 진행 상황과 피드백 관리하기

Unity 게임 개발 시, 자주 요구되는 기능 중 하나는 작업의 진행 상황을 사용자에게 효과적으로 보여주는 것입니다. 이 강의에서는 UniTask의 IProgress<T> 인터페이스와 Progress.Create 메서드를 활용하여 로딩 바와 같은 피드백 시스템을 구현하는 방법을 다룹니다.

## 학습 내용

- IProgress<T> 인터페이스와 Progress.Create 메서드 이해하기
- UniTask와 진행 상황 피드백 통합하기
- 실무에서의 로딩 바 구현 패턴
- Unity에서 비동기 작업의 진행 상황 시각화하기

## 실제 개발에서 마주하는 문제들

### 사용자 피드백의 중요성

게임 개발 중, 특히 긴 로딩 시간이나 복잡한 비동기 작업을 수행할 때, 사용자에게 현재 작업의 진행 상황을 알리는 것은 중요합니다. 사용자 경험(UX)을 고려할 때 이러한 피드백은 게임의 몰입도를 높이고 불필요한 방황을 줄일 수 있습니다.

```csharp
// 전형적인 비동기 작업 - 진행 상황 피드백이 없음
public async UniTask LoadGameAssetsAsync()
{
    // 다양한 리소스를 로딩
    await Resources.LoadAsync<TextAsset>("gameData");
    await SceneManager.LoadSceneAsync("MainScene");
    await UniTask.Delay(TimeSpan.FromSeconds(3));
    
    Debug.Log("Game assets loaded");
}
```
이 코드는 게임의 리소스를 로딩하지만, 사용자에게 아무런 피드백을 제공하지 않습니다. 이는 긴 로딩 시간 동안 사용자가 지루함을 느끼게 할 수 있습니다.

## UniTask와 IProgress<T> 사용하기

### IProgress<T>란 무엇인가?

IProgress<T> 인터페이스는 진행 상황의 변화를 보고하는 데 사용됩니다. UniTask는 이를 통해 비동기 작업의 진행 상황을 쉽게 전달할 수 있습니다.

### Progress.Create의 사용

Progress.Create 메서드는 IProgress<T> 인터페이스의 경량 인스턴스를 쉽게 생성할 수 있도록 도와줍니다. 이는 람다를 사용해 간단한 진행 상황 처리기를 정의할 수 있게 합니다.

```csharp
var progress = Progress.Create<float>(value => Debug.Log($"Loading progress: {value * 100}%"));
```

이 코드는 진행 상황 변화 시마다 로그 메시지를 출력하는 간단한 IProgress<float> 인스턴스를 생성합니다.

## 단계별 예제: 로딩 바 구현하기

### 1단계: 네임스페이스 추가하기

UniTask와 UnityWebRequest를 사용하기 위해 필요한 네임스페이스를 추가합니다.

```csharp
using Cysharp.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;
```

### 2단계: IProgress<T>로 로딩 진행 상황 관리하기

로딩 바를 구현하기 위해 IProgress<float>를 사용하여 진행 상황을 추적합니다.

```csharp
public class LoadingManager : MonoBehaviour, IProgress<float>
{
    public void Report(float value)
    {
        Debug.Log($"Loading progress: {value * 100}%");
    }

    public async UniTaskVoid LoadDataWithProgressAsync()
    {
        var request = await UnityWebRequest.Get("https://api.example.com/data")
            .SendWebRequest()
            .ToUniTask(progress: this);

        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Data loaded successfully!");
        }
        else
        {
            Debug.LogError("Failed to load data.");
        }
    }
}
```

### 3단계: UI와 통합하기

진행 상황을 사용자에게 보여주기 위해 UI 슬라이더를 활용합니다.

```csharp
public class UIController : MonoBehaviour, IProgress<float>
{
    [SerializeField]
    private UnityEngine.UI.Slider progressBar;

    public void Report(float value)
    {
        progressBar.value = value;
    }

    public async void StartLoading()
    {
        var loadingManager = GetComponent<LoadingManager>();
        if (loadingManager != null)
        {
            await loadingManager.LoadDataWithProgressAsync();
        }
    }
}
```

이 코드는 진행 상황에 따라 UI 슬라이더의 값을 업데이트합니다.

## 실습 과제

### 🎯 과제 1: 다단계 로딩 시스템 구현하기

1. 여러 리소스를 순차적으로 로딩하면서 각각의 진행 상황을 UI에 업데이트하는 시스템을 구현해보세요.
2. 각 단계의 로딩이 완료될 때마다 콘솔에 메시지를 출력하세요.

```csharp
public async UniTask LoadMultipleResourcesAsync(IProgress<float> progress)
{
    var steps = 3;
    float stepProgress = 1f / steps;

    // 첫 번째 리소스 로딩
    await Resources.LoadAsync<TextAsset>("resource1");
    progress.Report(stepProgress);

    // 두 번째 리소스 로딩
    await Resources.LoadAsync<TextAsset>("resource2");
    progress.Report(stepProgress * 2);

    // 세 번째 리소스 로딩
    await Resources.LoadAsync<TextAsset>("resource3");
    progress.Report(1.0f);
}
```

### 🎯 과제 2: 네트워크 요청의 진행 상황 표시

UniTask와 IProgress<T>를 사용하여 대규모 데이터 다운로드 시 진행 상황을 UI에 표시하는 기능을 구현하세요.

## ❌ 자주 하는 실수들

### 1. 람다를 사용한 IProgress<T>의 과도한 사용

```csharp
// ❌ 잘못된 방법 - 매번 람다로 인해 힙 메모리 할당 발생
var progress = Progress.Create<float>(value => Debug.Log(value));

// ✅ 올바른 방법 - IProgress<T> 인터페이스 구현
public class ProgressReporter : IProgress<float>
{
    public void Report(float value) => Debug.Log(value);
}
```

### 2. Progress.CreateOnlyValueChanged의 오용

```csharp
// ❌ 잘못된 방법 - 값 변경이 없을 때도 호출됨
var progress = Progress.Create<float>(value => Debug.Log(value));

// ✅ 올바른 방법 - 값 변경이 있을 때만 호출
var progress = Progress.CreateOnlyValueChanged<float>(value => Debug.Log(value));
```

## ✅ 모범 사례

### 1. IProgress<T> 인터페이스 구현
```csharp
public class ProgressReporter : MonoBehaviour, IProgress<float>
{
    public void Report(float value)
    {
        Debug.Log($"Progress: {value * 100}%");
    }
}
```

### 2. 로딩 바와의 통합
```csharp
public class ProgressSlider : MonoBehaviour, IProgress<float>
{
    [SerializeField]
    private UnityEngine.UI.Slider slider;

    public void Report(float value)
    {
        slider.value = value;
    }
}
```

### 3. 다양한 비동기 작업의 피드백 통합
```csharp
public async UniTask ProcessTasksWithProgressAsync()
{
    var progress = new ProgressReporter();
    await LoadMultipleResourcesAsync(progress);
    await DownloadLargeFileAsync(progress);
}
```

## 요약

- UniTask를 활용하여 Unity에서 비동기 작업의 진행 상황을 효과적으로 관리할 수 있습니다.
- IProgress<T> 인터페이스는 진행 상황 피드백을 제공하는 데 중요한 역할을 하며, Progress.Create를 통해 쉽게 인스턴스를 생성할 수 있습니다.
- UI와의 통합을 통해 사용자 경험을 향상시킬 수 있으며, 실무에서는 로딩 바 등을 통해 이를 구현합니다.

## 🚀 다음 단계

다음 강의에서는 병렬 처리를 다루며, 여러 비동기 작업을 효율적으로 관리하는 방법을 살펴보겠습니다. UniTask.WhenAll/WhenAny와 같은 고급 기능을 사용하여 게임 개발에서의 병렬 처리 기술을 마스터하세요.
```
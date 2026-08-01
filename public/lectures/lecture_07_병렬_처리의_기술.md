# 7강. 병렬 처리의 기술

> **강의 설명**: WhenAll, WhenAny, 복합 작업 조합, 조건부 병렬 처리  
> **생성 일시**: 2025-07-13 19:36:17

---

# UniTask 병렬 처리의 기술

Unity에서 비동기 작업을 다루는 것은 게임의 성능과 사용자 경험을 크게 좌우할 수 있습니다. 이번 강의에서는 UniTask의 병렬 처리 기능을 활용하여 게임 개발에서 고성능 비동기 프로그래밍을 구현하는 방법을 배워보겠습니다.

## 학습 내용

- UniTask의 병렬 처리 기능 이해하기
- WhenAll, WhenAny API 사용법 익히기
- 조건부 병렬 처리 및 복합 작업 조합 패턴 배우기
- 실제 게임 개발에서의 활용 사례

## 실제 개발에서 마주하는 문제들

### 복잡한 비동기 작업의 병렬 처리

Unity 게임 개발에서는 종종 여러 비동기 작업을 동시에 수행해야 할 필요가 있습니다. 예를 들어, 게임 시작 시 여러 리소스를 동시에 로드하거나, 네트워크 요청과 데이터 로딩을 병렬로 처리할 수 있습니다. 전통적인 Coroutine을 사용할 경우, 이러한 병렬 처리를 구현하는 것은 복잡하고 비효율적일 수 있습니다.

#### 전형적인 Coroutine 병렬 처리의 한계

```csharp
// 여러 Coroutine을 사용한 병렬 처리 - 복잡하고 관리가 어려움
public class GameManager : MonoBehaviour
{
    public IEnumerator StartGameSetup()
    {
        // 리소스 로딩
        var loadResource1 = StartCoroutine(LoadResource1());
        var loadResource2 = StartCoroutine(LoadResource2());

        // 네트워크 요청
        var fetchData = StartCoroutine(FetchData());

        yield return loadResource1;
        yield return loadResource2;
        yield return fetchData;

        Debug.Log("All setup tasks completed");
    }

    private IEnumerator LoadResource1()
    {
        yield return new WaitForSeconds(2); // Simulate resource loading
        Debug.Log("Resource 1 loaded");
    }

    private IEnumerator LoadResource2()
    {
        yield return new WaitForSeconds(3); // Simulate resource loading
        Debug.Log("Resource 2 loaded");
    }

    private IEnumerator FetchData()
    {
        yield return new WaitForSeconds(1); // Simulate data fetching
        Debug.Log("Data fetched");
    }
}
```

이러한 Coroutine 기반의 병렬 처리 방식은 코드가 복잡해지고, 각 작업의 완료를 개별적으로 관리해야 하므로 유지보수가 어렵습니다.

## UniTask란 무엇인가?

UniTask는 이러한 문제를 해결하기 위해 설계된 Unity에 특화된 고성능 비동기 프로그래밍 라이브러리입니다. UniTask를 사용하면 복잡한 비동기 작업을 효율적으로 병렬 처리할 수 있으며, 코드의 가독성과 유지보수성을 높일 수 있습니다.

### UniTask의 병렬 처리 API

- **WhenAll**: 여러 작업을 동시에 실행하고, 모든 작업이 완료될 때까지 대기
- **WhenAny**: 여러 작업 중 하나가 완료될 때까지 대기

### WhenAll과 WhenAny의 사용 예

#### UniTask를 이용한 간단한 병렬 처리

```csharp
using Cysharp.Threading.Tasks;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    private async UniTaskVoid Start()
    {
        await LoadGameSetupAsync();
    }

    private async UniTask LoadGameSetupAsync()
    {
        // 여러 작업을 동시에 실행
        await UniTask.WhenAll(LoadResource1Async(), LoadResource2Async(), FetchDataAsync());

        Debug.Log("All setup tasks completed");
    }

    private async UniTask LoadResource1Async()
    {
        await UniTask.Delay(TimeSpan.FromSeconds(2)); // Simulate resource loading
        Debug.Log("Resource 1 loaded");
    }

    private async UniTask LoadResource2Async()
    {
        await UniTask.Delay(TimeSpan.FromSeconds(3)); // Simulate resource loading
        Debug.Log("Resource 2 loaded");
    }

    private async UniTask FetchDataAsync()
    {
        await UniTask.Delay(TimeSpan.FromSeconds(1)); // Simulate data fetching
        Debug.Log("Data fetched");
    }
}
```

이 코드 예제에서는 `WhenAll`을 사용하여 여러 비동기 작업을 동시에 실행하고, 모든 작업이 완료되면 다음 단계로 넘어갑니다. 이는 코드의 가독성을 높이고, 병렬 처리의 복잡성을 줄이는 데 큰 도움을 줍니다.

## 실습 과제

### 🎯 과제 1: WhenAll을 활용한 게임 초기화

여러 리소스를 동시에 로딩하고, 모든 리소스가 로드된 후 게임을 시작하는 로직을 구현해보세요.

**요구사항:**
1. 리소스 3개를 동시에 비동기적으로 로딩
2. 각 로딩 작업은 2초, 3초, 1초가 소요됨
3. 모든 로딩이 완료된 후 "All resources loaded" 메시지 출력

**힌트:**
```csharp
public async UniTask<bool> LoadAllResourcesAsync()
{
    await UniTask.WhenAll(LoadResource1Async(), LoadResource2Async(), LoadResource3Async());
    Debug.Log("All resources loaded");
    return true;
}
```

### 🎯 과제 2: WhenAny를 활용한 사용자 입력 대기

사용자가 입력을 제공하거나 일정 시간이 경과할 때까지 대기하는 로직을 구현해보세요.

**요구사항:**
1. 사용자 입력을 기다리거나 5초가 지나면 자동으로 진행
2. 입력이 있을 경우 "User input received" 메시지 출력
3. 시간이 지난 경우 "Timeout reached" 메시지 출력

**힌트:**
```csharp
public async UniTask WaitForUserInputOrTimeoutAsync()
{
    if (await UniTask.WhenAny(UserInputAsync(), UniTask.Delay(TimeSpan.FromSeconds(5))) == 0)
    {
        Debug.Log("User input received");
    }
    else
    {
        Debug.Log("Timeout reached");
    }
}

private async UniTask UserInputAsync()
{
    // 사용자 입력 대기 로직 구현
}
```

## ❌ 자주 하는 실수들

### 1. WhenAll 사용 시 예외 처리 누락

WhenAll을 사용할 때, 개별 작업에서 발생한 예외를 간과할 수 있습니다. 모든 작업을 안전하게 처리하려면 try-catch 블록을 사용해야 합니다.

```csharp
// ❌ 잘못된 방법 - 예외가 처리되지 않음
await UniTask.WhenAll(TaskThatMayFail());

// ✅ 올바른 방법
try
{
    await UniTask.WhenAll(TaskThatMayFail());
}
catch (Exception ex)
{
    Debug.LogError("An error occurred: " + ex.Message);
}
```

### 2. WhenAny 사용 시 결과 처리 누락

WhenAny를 사용할 때, 완료된 작업의 결과를 적절히 처리하지 않으면 원하는 동작을 수행하지 못할 수 있습니다.

```csharp
// ❌ 잘못된 방법 - 완료된 작업의 결과를 확인하지 않음
await UniTask.WhenAny(SlowTask(), FastTask());

// ✅ 올바른 방법
var completedTaskIndex = await UniTask.WhenAny(SlowTask(), FastTask());
if (completedTaskIndex == 0)
{
    Debug.Log("SlowTask completed first");
}
else
{
    Debug.Log("FastTask completed first");
}
```

## ✅ 모범 사례

### 1. 복합 작업 조합

여러 비동기 작업을 조합하여 복잡한 비즈니스 로직을 구현할 때, WhenAll과 WhenAny를 적절히 사용하여 코드의 복잡성을 줄일 수 있습니다.

```csharp
public async UniTask InitializeGameAsync()
{
    var loadResources = LoadResourcesAsync();
    var initializeSystems = InitializeSystemsAsync();
    
    await UniTask.WhenAll(loadResources, initializeSystems);

    Debug.Log("Game initialized");
}
```

### 2. 조건부 병렬 처리

특정 조건에 따라 병렬 처리를 실행하는 로직을 작성할 때, 조건문과 UniTask를 결합하여 처리할 수 있습니다.

```csharp
public async UniTask ConditionalTaskExecutionAsync(bool condition)
{
    if (condition)
    {
        await UniTask.WhenAll(TaskAAsync(), TaskBAsync());
    }
    else
    {
        await TaskCAsync();
    }
}
```

## 요약

- **WhenAll과 WhenAny는 UniTask의 강력한 병렬 처리 도구**로, 여러 비동기 작업을 효율적으로 관리할 수 있습니다.
- **코드의 가독성과 유지보수성을 높일 수 있으며**, 복잡한 비동기 로직을 간단하게 처리할 수 있습니다.
- **실제 게임 개발 시나리오에서의 활용**을 통해 UniTask의 병렬 처리 기능을 익히고, 다양한 실무에서 응용할 수 있습니다.

## 🚀 다음 단계

다음 강의에서는 UniTask의 고급 기능들을 다뤄보겠습니다:
- **UniTaskCompletionSource**를 활용한 커스텀 비동기 작업 만들기
- **AsyncEnumerable**을 이용한 비동기 스트림 처리
- **UniTaskTracker**를 통한 메모리 누수 디버깅

이번 강의를 통해 UniTask의 병렬 처리 기능을 이해하고, Unity 게임 개발에서 더욱 효율적인 비동기 프로그래밍을 구현해보세요!
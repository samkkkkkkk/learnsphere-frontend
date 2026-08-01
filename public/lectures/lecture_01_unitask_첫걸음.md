# 1강. UniTask 첫걸음

> **강의 설명**: UniTask vs Coroutine, 기본 async/await, AsyncOperation  
> **생성 일시**: 2025-07-13 19:12:40

---

```markdown
# UniTask를 사용한 고성능 비동기 프로그래밍

Unity에서 비동기 프로그래밍은 게임의 반응성을 높이고 사용자 경험을 향상시키기 위해 필수적입니다. 많은 개발자들이 Coroutine을 사용하지만, UniTask는 더 나은 성능과 쉬운 에러 처리를 제공하여 Coroutine을 대체할 수 있는 강력한 대안입니다.

## 학습 내용

- UniTask의 필요성과 장점 이해하기
- Coroutine과 UniTask의 성능 비교
- UniTask의 기본 사용법 익히기
- async/await 패턴으로 비동기 코드 작성하기
- Unity의 AsyncOperation을 UniTask로 활용하기

## 실제 개발에서 마주하는 문제들

### Coroutine의 한계점

많은 Unity 개발자들에게 익숙한 Coroutine은 다음과 같은 문제를 안고 있습니다:

```csharp
// 전형적인 Coroutine 코드 - 복잡한 에러 처리
public class DataLoader : MonoBehaviour
{
    public IEnumerator LoadDataCoroutine()
    {
        var request = Resources.LoadAsync<TextAsset>("gameData");
        yield return request;
        
        if (request.asset == null)
        {
            Debug.LogError("Failed to load game data");
            yield break;
        }
        
        var www = UnityWebRequest.Get("https://api.example.com/data");
        yield return www.SendWebRequest();
        
        if (www.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("Network error: " + www.error);
            yield break;
        }
        
        yield return new WaitForSeconds(3f);
        
        yield return SceneManager.LoadSceneAsync("NextScene");
    }
}
```

이런 Coroutine 코드의 문제점들:
- **복잡한 에러 처리**: try-catch를 사용할 수 없어 에러 처리가 번거로움
- **메모리 할당**: yield return마다 GC 할당이 발생
- **디버깅 어려움**: 스택 트레이스가 명확하지 않음
- **취소 처리 복잡**: 중간에 작업을 취소하기 어려움

## UniTask란 무엇인가?

UniTask는 Unity에 특화된 고성능 async/await 통합 라이브러리로, Task보다 가볍고 Unity의 단일 스레드 환경에 최적화되어 있습니다.

### 핵심 특징들

- **제로 할당**: struct 기반 UniTask<T>와 커스텀 AsyncMethodBuilder로 제로 할당을 달성
- **Unity 통합**: 모든 Unity AsyncOperation과 Coroutine을 awaitable하게 만듦
- **PlayerLoop 기반**: Unity의 PlayerLoop에서 완전히 실행되므로 스레드를 사용하지 않고 WebGL, WASM 등에서도 동작
- **표준 호환**: Task/ValueTask와 높은 호환성

### Coroutine vs UniTask 성능 비교

| 특징 | Coroutine | UniTask |
|------|-----------|---------|
| 메모리 할당 | 매번 GC 할당 발생 | 제로 할당 |
| 에러 처리 | yield break로 복잡함 | try-catch 사용 가능 |
| 취소 처리 | 수동 구현 필요 | CancellationToken 지원 |
| 성능 | 상대적으로 느림 | 고성능 |
| 디버깅 | 스택 트레이스 불명확 | 명확한 디버깅 정보 |

## UniTask 시작하기

### 1단계: 네임스페이스 추가하기

UniTask를 사용하려면 먼저 네임스페이스를 추가해야 합니다:

```csharp
using Cysharp.Threading.Tasks;
```

### 2단계: 기본 UniTask 메서드 작성하기

이제 앞서 본 복잡한 Coroutine을 UniTask로 변환해보겠습니다:

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.Networking;
using Cysharp.Threading.Tasks;
using System;

public class DataLoader : MonoBehaviour
{
    public async UniTask<bool> LoadDataAsync()
    {
        try
        {
            var asset = await Resources.LoadAsync<TextAsset>("gameData");
            
            if (asset == null)
            {
                throw new Exception("Failed to load game data");
            }
            
            var response = await UnityWebRequest.Get("https://api.example.com/data")
                .SendWebRequest();
            
            await UniTask.Delay(TimeSpan.FromSeconds(3));
            
            await SceneManager.LoadSceneAsync("NextScene");
            
            return true;
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error loading data: {ex.Message}");
            return false;
        }
    }
}
```

### 3단계: UniTask 메서드 호출하기

```csharp
public class GameManager : MonoBehaviour
{
    private DataLoader dataLoader;
    
    private async void Start()
    {
        dataLoader = FindObjectOfType<DataLoader>();
        
        bool success = await dataLoader.LoadDataAsync();
        
        if (success)
        {
            Debug.Log("Data loaded successfully!");
        }
        else
        {
            Debug.Log("Failed to load data");
        }
    }
}
```

> **💡 중요합니다!**
> 
> MonoBehaviour의 Start, Update 등에서 async void를 사용할 수 있지만, 가능하면 async UniTaskVoid를 사용하는 것이 좋습니다.

## Unity AsyncOperation과 UniTask

Unity의 모든 비동기 작업들을 UniTask로 쉽게 변환할 수 있습니다:

### 리소스 로딩

```csharp
var sprite = await Resources.LoadAsync<Sprite>("character");
```

### 씬 로딩

```csharp
await SceneManager.LoadSceneAsync("NextScene");
```

### 네트워크 요청

```csharp
var request = await UnityWebRequest.Get("https://api.example.com")
    .SendWebRequest();
```

## 시간 기반 대기 작업

UniTask는 PlayerLoop 기반 작업들(UniTask.Yield, UniTask.Delay, UniTask.DelayFrame 등)을 제공하여 모든 coroutine 작업을 대체할 수 있습니다.

### 시간 대기

```csharp
await UniTask.Delay(TimeSpan.FromSeconds(2));
await UniTask.Delay(TimeSpan.FromSeconds(2), ignoreTimeScale: true);
```

### 프레임 대기

```csharp
await UniTask.Yield();
await UniTask.DelayFrame(10);
await UniTask.NextFrame();
```

### 조건 대기

```csharp
await UniTask.WaitUntil(() => player.isReady);
await UniTask.WaitUntilValueChanged(player, x => x.health);
```

## 취소 토큰(CancellationToken) 활용

UniTask의 강력한 기능 중 하나는 취소 처리입니다:

```csharp
public class SkillController : MonoBehaviour
{
    public async UniTask CastSpellAsync()
    {
        var cancellationToken = this.GetCancellationTokenOnDestroy();
        
        try
        {
            await UniTask.Delay(TimeSpan.FromSeconds(3), 
                cancellationToken: cancellationToken);
            
            Debug.Log("Spell cast complete!");
        }
        catch (OperationCanceledException)
        {
            Debug.Log("Spell casting was cancelled");
        }
    }
}
```

## 실습 과제

### 🎯 과제 1: 로딩 시스템 구현하기

다음 요구사항을 만족하는 로딩 시스템을 UniTask로 구현해보세요:

**요구사항:**
1. 리소스 3개를 순차적으로 로딩
2. 각 로딩 사이에 1초씩 대기
3. 로딩 실패 시 에러 메시지 출력
4. 전체 로딩 완료 시 성공 메시지 출력

**힌트:**
```csharp
public async UniTask<bool> LoadGameAssetsAsync()
{
    try
    {
        return true;
    }
    catch (Exception ex)
    {
        Debug.LogError($"Loading failed: {ex.Message}");
        return false;
    }
}
```

### 🎯 과제 2: 비동기 애니메이션 시퀀스

DOTween이나 Animation을 사용하여 순차적으로 실행되는 애니메이션 시퀀스를 구현해보세요.

## ❌ 자주 하는 실수들

### 1. async void 사용
```csharp
// ❌ 잘못된 방법
public async void BadMethod()
{
    await UniTask.Delay(1000);
}

// ✅ 올바른 방법
public async UniTaskVoid GoodMethod()
{
    await UniTask.Delay(1000);
}
```

### 2. UniTask 중복 await
```csharp
// ❌ 잘못된 방법 - UniTask는 두 번 await할 수 없음
var task = UniTask.Delay(1000);
await task;
await task; // Exception 발생!

// ✅ 올바른 방법
var task = UniTask.Delay(1000).Preserve();
await task;
await task;
```

### 3. CancellationToken 무시
```csharp
// ❌ 취소 처리 없음
public async UniTask LongOperation()
{
    await UniTask.Delay(10000);
}

// ✅ 취소 토큰 사용
public async UniTask LongOperation(CancellationToken ct)
{
    await UniTask.Delay(10000, cancellationToken: ct);
}
```

## ✅ 모범 사례

### 1. 항상 CancellationToken 전달
```csharp
public async UniTask ProcessDataAsync(CancellationToken ct = default)
{
    await LoadDataAsync(ct);
    await ProcessDataAsync(ct);
    await SaveDataAsync(ct);
}
```

### 2. 에러 처리 패턴
```csharp
public async UniTask<Result<T>> SafeOperationAsync<T>()
{
    try
    {
        var result = await RiskyOperationAsync();
        return Result<T>.Success(result);
    }
    catch (Exception ex)
    {
        return Result<T>.Failure(ex.Message);
    }
}
```

### 3. GameObject 생명주기와 연동
```csharp
public class MyBehaviour : MonoBehaviour
{
    private async void Start()
    {
        await LongRunningTaskAsync(this.GetCancellationTokenOnDestroy());
    }
}
```

## 요약

- **UniTask는 Unity 전용 고성능 비동기 라이브러리**로 Coroutine을 완전히 대체할 수 있습니다
- **제로 할당과 빠른 실행 속도**로 성능상 이점이 큽니다
- **async/await 패턴**으로 더 읽기 쉽고 유지보수하기 좋은 코드를 작성할 수 있습니다
- **CancellationToken**을 활용하여 강력한 취소 처리가 가능합니다
- **Unity의 모든 AsyncOperation**을 자연스럽게 await할 수 있습니다
- **에러 처리**가 try-catch로 간단해집니다

## 🚀 다음 단계

다음 강의에서는 UniTask의 고급 기능들을 다뤄보겠습니다:
- **UniTask.WhenAll/WhenAny**: 여러 작업을 병렬로 처리하기
- **UniTaskCompletionSource**: 커스텀 비동기 작업 만들기  
- **AsyncEnumerable**: 비동기 스트림 처리하기
- **UniTaskTracker**: 메모리 누수 디버깅하기
```

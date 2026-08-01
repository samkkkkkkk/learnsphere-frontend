# 3강. Unity AsyncOperation 완전 정복

> **강의 설명**: SceneManager, Resources, UnityWebRequest, Addressables 비동기 처리  
> **생성 일시**: 2025-07-13 19:28:39

---

# Unity AsyncOperation 완전 정복

Unity에서의 비동기 프로그래밍은 성능 최적화와 사용자 경험 향상을 위해 필수적인 요소입니다. 특히, AsyncOperation을 중심으로 하는 비동기 작업은 다양한 게임 개발 시나리오에서 광범위하게 활용됩니다. 본 강의에서는 Unity의 AsyncOperation을 활용한 고성능 비동기 프로그래밍 기법을 UniTask와 함께 심도 있게 탐구합니다. 주요 API와 실무 예제를 통해 실제 개발 환경에서 유용하게 사용할 수 있는 방법들을 학습할 것입니다.

## 학습 내용

- AsyncOperation의 작동 원리와 UniTask로의 변환 이해하기
- SceneManager, Resources, UnityWebRequest, Addressables의 비동기 처리
- 실무 예제를 통한 고급 활용 패턴 습득
- UniTask를 활용한 에러 처리와 효율적인 자원 관리

## 실제 개발에서 마주하는 문제들

### 비동기 씬 로딩의 복잡함

게임 개발에서 씬 전환은 일반적인 작업입니다. 하지만 대형 씬을 로드할 때 비동기적으로 처리하지 않으면 프레임 드랍이나 응답 없음 상태가 발생할 수 있습니다. 아래는 전형적인 Coroutine을 사용한 방법입니다:

```csharp
public class SceneLoader : MonoBehaviour
{
    public IEnumerator LoadSceneCoroutine(string sceneName)
    {
        AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
        while (!asyncLoad.isDone)
        {
            yield return null; // 프레임마다 반복
        }
    }
}
```

이 방식의 문제점은 다음과 같습니다:
- **복잡성 증가**: 비동기 작업의 상태를 수동으로 체크해야 함
- **취소 불가**: 중간에 작업을 취소하는 것이 까다로움
- **에러 처리의 어려움**: 에러 발생 시 적절한 대응이 어려움

## Unity AsyncOperation과 UniTask

UniTask를 활용하면 AsyncOperation을 더욱 간결하고 효과적으로 다룰 수 있습니다. UniTask는 Zero-allocation 및 강력한 비동기 기능을 제공하여 비동기 작업을 매끄럽게 처리할 수 있게 해줍니다.

### SceneManager.LoadSceneAsync

씬 로딩을 UniTask로 변환하면 다음과 같이 간단해집니다:

```csharp
using UnityEngine;
using Cysharp.Threading.Tasks;

public class SceneLoader : MonoBehaviour
{
    public async UniTask LoadSceneAsync(string sceneName)
    {
        try
        {
            await SceneManager.LoadSceneAsync(sceneName);
        }
        catch (Exception ex)
        {
            Debug.LogError($"Failed to load scene: {ex.Message}");
        }
    }
}
```

### Resources.LoadAsync

리소스를 비동기적으로 로드하는 것도 UniTask로 간편하게 처리할 수 있습니다:

```csharp
public async UniTask<T> LoadResourceAsync<T>(string path) where T : UnityEngine.Object
{
    var resource = await Resources.LoadAsync<T>(path);
    if (resource == null)
    {
        throw new Exception($"Failed to load resource at {path}");
    }
    return (T)resource;
}
```

### UnityWebRequest.Get

네트워크 요청을 UniTask로 처리하면 에러 처리가 훨씬 간단해집니다:

```csharp
public async UniTask<string> FetchDataAsync(string url)
{
    try
    {
        var request = await UnityWebRequest.Get(url).SendWebRequest();
        if (request.result != UnityWebRequest.Result.Success)
        {
            throw new Exception(request.error);
        }
        return request.downloadHandler.text;
    }
    catch (Exception ex)
    {
        Debug.LogError($"Network error: {ex.Message}");
        return null;
    }
}
```

### Addressables.LoadAssetAsync

Addressables 시스템을 사용할 때도 UniTask를 활용하여 더욱 효율적인 비동기 자원 로딩을 구현할 수 있습니다:

```csharp
using UnityEngine.AddressableAssets;
using Cysharp.Threading.Tasks;

public async UniTask<T> LoadAddressableAsync<T>(string assetKey)
{
    var handle = Addressables.LoadAssetAsync<T>(assetKey);
    var asset = await handle.ToUniTask();
    if (asset == null)
    {
        Addressables.Release(handle);
        throw new Exception($"Failed to load addressable asset: {assetKey}");
    }
    return asset;
}
```

## 실습 과제

### 🎯 과제 1: 비동기 씬 전환 시스템 구현하기

주어진 씬 이름을 비동기적으로 로드하고, 로딩 바를 업데이트하는 시스템을 UniTask로 구현해보세요.

**요구사항:**
1. 씬 로딩 진행도에 따라 UI 업데이트
2. 로딩 취소 기능 제공
3. 로딩 완료 시 콜백 호출

**힌트:**
```csharp
public async UniTask LoadSceneWithProgressAsync(string sceneName, IProgress<float> progress, CancellationToken ct)
{
    var asyncLoad = SceneManager.LoadSceneAsync(sceneName);
    asyncLoad.allowSceneActivation = false;
    
    while (!asyncLoad.isDone)
    {
        progress.Report(asyncLoad.progress);
        
        if (asyncLoad.progress >= 0.9f)
        {
            // 씬 활성화
            asyncLoad.allowSceneActivation = true;
        }
        
        await UniTask.Yield(PlayerLoopTiming.Update, ct);
    }
}
```

### 🎯 과제 2: 네트워크 데이터 비동기 로딩

주어진 API URL에서 JSON 데이터를 비동기적으로 로드하고 파싱하는 시스템을 구현하세요.

**요구사항:**
1. JSON 데이터 파싱
2. 요청 실패 시 재시도 기능
3. 로딩 시간 초과 처리

## ❌ 자주 하는 실수들

### 1. AsyncOperation을 중복으로 await

AsyncOperation은 두 번 이상 await할 수 없습니다. 이를 피하기 위해 UniTask의 Preserve 메서드를 사용하세요.

```csharp
// ❌ 잘못된 방법
var loadTask = SceneManager.LoadSceneAsync("GameScene");
await loadTask; // 첫 await
await loadTask; // 두 번째 await, 에러 발생!

// ✅ 올바른 방법
var loadTask = SceneManager.LoadSceneAsync("GameScene").Preserve();
await loadTask;
await loadTask;
```

### 2. 에러 처리를 생략

비동기 작업에서 발생할 수 있는 에러를 항상 처리하세요.

```csharp
// ❌ 에러 처리 없음
await UnityWebRequest.Get("https://api.example.com").SendWebRequest();

// ✅ 에러 처리 추가
try
{
    var request = await UnityWebRequest.Get("https://api.example.com").SendWebRequest();
    // 데이터 처리
}
catch (Exception ex)
{
    Debug.LogError($"Network error: {ex.Message}");
}
```

## ✅ 모범 사례

### 1. CancellationToken과 함께 작업

비동기 작업은 항상 취소 가능하도록 설계해야 합니다.

```csharp
public async UniTask LoadDataAsync(CancellationToken ct)
{
    await Resources.LoadAsync<TextAsset>("data").WithCancellation(ct);
}
```

### 2. 에러와 상태 확인 패턴

비동기 작업의 결과를 확인하고 실패 시 적절하게 대응합니다.

```csharp
public async UniTask<bool> TryLoadAssetAsync(string assetKey)
{
    try
    {
        var asset = await Addressables.LoadAssetAsync<GameObject>(assetKey);
        return asset != null;
    }
    catch (Exception ex)
    {
        Debug.LogError($"Failed to load asset {assetKey}: {ex.Message}");
        return false;
    }
}
```

## 요약

- **Unity AsyncOperation**을 UniTask로 변환하여 비동기 코드의 복잡성을 줄이고 성능을 향상시킵니다.
- **SceneManager, Resources, UnityWebRequest, Addressables**의 비동기 작업을 효과적으로 다룰 수 있습니다.
- **에러 처리와 취소 가능성**을 고려한 안전한 비동기 코딩 패턴을 습득합니다.
- **실무 예제**를 통해 실제 게임 개발 상황에 적용할 수 있는 기술을 배웁니다.

## 🚀 다음 단계

다음 강의에서는 **취소 시스템 마스터하기**에 대해 다뤄보겠습니다. UniTask의 취소 토큰을 활용하여 더욱 강력하고 유연한 비동기 작업을 구현하는 방법을 배울 것입니다.
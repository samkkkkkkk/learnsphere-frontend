# 4강. 취소 시스템 마스터하기

> **강의 설명**: CancellationToken 심화, GetCancellationTokenOnDestroy, CancelAfterSlim  
> **생성 일시**: 2025-07-13 19:32:58

---

# UniTask 강의 시리즈 4강: 취소 시스템 마스터하기

UniTask를 활용한 비동기 프로그래밍에서 취소 시스템은 개발자의 필수 도구입니다. 이 강의에서는 UniTask의 취소 시스템을 깊이 있게 탐구하고, CancellationToken 및 관련 API를 통해 실무에서의 적용 방법을 익혀보겠습니다.

## 학습 내용

- CancellationToken의 개념과 필요성
- GetCancellationTokenOnDestroy의 활용
- UniTask.CancelAfterSlim을 통한 타임아웃 처리
- OperationCanceledException을 통한 취소된 작업 처리

## 실제 개발에서 마주하는 문제들

### 비동기 작업의 취소 처리

Unity 게임 개발에서는 여러 비동기 작업이 동시에 실행될 수 있습니다. 이러한 작업은 사용자가 게임을 종료하거나 특정 조건이 만족될 때 안전하게 취소되어야 합니다. 전통적인 방식으로는 각 작업에 대해 수동으로 취소 로직을 구현해야 했습니다. 하지만 UniTask의 취소 시스템을 활용하면 이 과정이 훨씬 간단해집니다.

```csharp
// 기본적인 Coroutine 방식에서의 취소 처리
public class SkillController : MonoBehaviour
{
    private bool isCancelled = false;

    public IEnumerator CastSpellCoroutine()
    {
        while (!isCancelled)
        {
            // 스킬 시전 로직
            yield return null;
        }
    }

    public void CancelSpell()
    {
        isCancelled = true;
    }
}
```

이와 같은 수동 취소 방식은 관리가 어렵고 실수하기 쉽습니다. UniTask에서는 CancellationToken을 통해 보다 구조적이고 안전하게 작업을 취소할 수 있습니다.

## UniTask의 취소 시스템

### CancellationToken의 이해

CancellationToken은 특정 비동기 작업의 취소를 요청할 수 있는 구조체입니다. 이를 통해 작업을 안전하게 중단할 수 있으며, 취소된 작업은 OperationCanceledException을 통해 관리됩니다.

```csharp
public async UniTask CastSpellAsync(CancellationToken cancellationToken)
{
    try
    {
        // 스킬 시전 중 3초 대기
        await UniTask.Delay(TimeSpan.FromSeconds(3), cancellationToken: cancellationToken);
        Debug.Log("Spell cast complete!");
    }
    catch (OperationCanceledException)
    {
        Debug.Log("Spell casting was cancelled");
    }
}
```

### GetCancellationTokenOnDestroy 활용

MonoBehaviour의 라이프사이클과 결합하여 비동기 작업을 자동으로 취소할 수 있습니다. GameObject가 파괴될 때 해당 작업도 취소되도록 설정할 수 있습니다.

```csharp
public class GameManager : MonoBehaviour
{
    private async void Start()
    {
        var cancellationToken = this.GetCancellationTokenOnDestroy();

        await LoadGameAsync(cancellationToken);
    }

    private async UniTask LoadGameAsync(CancellationToken cancellationToken)
    {
        // 씬 로딩 비동기 작업
        await SceneManager.LoadSceneAsync("GameScene", LoadSceneMode.Single)
                          .WithCancellation(cancellationToken);
    }
}
```

### CancelAfterSlim으로 타임아웃 구현

특정 작업에 대해 타임아웃을 설정하여 일정 시간이 지나면 자동으로 취소되도록 할 수 있습니다. 이는 네트워크 요청과 같이 시간이 오래 걸릴 수 있는 작업에 유용합니다.

```csharp
public async UniTask FetchDataWithTimeoutAsync()
{
    var cts = new CancellationTokenSource();
    cts.CancelAfterSlim(TimeSpan.FromSeconds(5)); // 5초 후 타임아웃

    try
    {
        var request = await UnityWebRequest.Get("http://example.com")
                                           .SendWebRequest()
                                           .WithCancellation(cts.Token);

        Debug.Log("Data fetched successfully");
    }
    catch (OperationCanceledException)
    {
        Debug.Log("Fetching data was cancelled or timed out");
    }
}
```

## 실습 과제

### 🎯 과제 1: 자동 취소가 포함된 리소스 로딩 시스템

리소스를 비동기적으로 로딩하되, 특정 시간 후 자동으로 취소되도록 시스템을 구현하세요.

**요구사항:**
1. 리소스 2개를 병렬로 로딩
2. 각 로딩은 3초 후 타임아웃
3. 성공 및 실패 시 각각의 로그 출력

### 🎯 과제 2: GameObject 파괴 시 비동기 작업 취소

특정 GameObject가 파괴될 때 그와 연관된 비동기 작업이 자동으로 취소되도록 하세요.

**요구사항:**
1. 비동기 스킬 시전 구현
2. GameObject 파괴 시 스킬 취소
3. 취소 시 로그 출력

## ❌ 자주 하는 실수들

### 1. 취소 토큰을 전달하지 않음

```csharp
// ❌ 잘못된 방법
public async UniTask LoadDataAsync()
{
    await UniTask.Delay(10000); // 취소 불가
}

// ✅ 올바른 방법
public async UniTask LoadDataAsync(CancellationToken ct)
{
    await UniTask.Delay(10000, cancellationToken: ct);
}
```

### 2. OperationCanceledException을 처리하지 않음

```csharp
// ❌ 잘못된 방법 - 예외 처리 없음
public async UniTask PerformTaskAsync(CancellationToken ct)
{
    await UniTask.Delay(5000, cancellationToken: ct);
}

// ✅ 올바른 방법
public async UniTask PerformTaskAsync(CancellationToken ct)
{
    try
    {
        await UniTask.Delay(5000, cancellationToken: ct);
    }
    catch (OperationCanceledException)
    {
        Debug.Log("Task was cancelled");
    }
}
```

## ✅ 모범 사례

### 1. 모든 비동기 메서드에 CancellationToken 전달

```csharp
public async UniTask ProcessOperationsAsync(CancellationToken ct = default)
{
    await LoadResourcesAsync(ct);
    await ExecuteTasksAsync(ct);
    await FinalizeProcessAsync(ct);
}
```

### 2. 자동 취소 설정

MonoBehaviour와 결합하여 자동으로 취소되는 비동기 작업을 설정하여 메모리 누수를 방지합니다.

```csharp
public class AutoCancellationExample : MonoBehaviour
{
    private async void Start()
    {
        await LongRunningOperationAsync(this.GetCancellationTokenOnDestroy());
    }
}
```

## 요약

- **CancellationToken**을 통해 안전하고 구조적인 비동기 작업 취소가 가능합니다.
- **GetCancellationTokenOnDestroy**를 사용하여 GameObject 라이프사이클과 결합된 자동 취소를 구현할 수 있습니다.
- **CancelAfterSlim**을 활용하여 타임아웃을 설정하고, 작업이 지정된 시간 내에 완료되지 않으면 자동으로 취소할 수 있습니다.
- **OperationCanceledException**을 사용하여 취소된 작업을 적절히 처리할 수 있습니다.

## 🚀 다음 단계

다음 강의에서는 UniTask의 예외 처리와 안전한 코딩 패턴을 심도 있게 다루겠습니다:
- **예외 처리 패턴**: 안전하고 명확한 예외 처리 구현
- **안전한 비동기 코딩**: 실수 방지를 위한 모범 사례

이상으로 UniTask의 취소 시스템에 대한 강의를 마칩니다. 실무에서 이러한 기술들을 활용하여 더욱 안전하고 효율적인 Unity 비동기 프로그래밍을 구현해보세요.
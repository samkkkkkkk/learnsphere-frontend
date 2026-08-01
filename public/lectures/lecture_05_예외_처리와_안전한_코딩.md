# 5강. 예외 처리와 안전한 코딩

> **강의 설명**: try-catch 패턴, OperationCanceledException, Result<T> 패턴  
> **생성 일시**: 2025-07-13 19:33:57

---

# UniTask 5강: 예외 처리와 안전한 코딩

Unity에서 비동기 프로그래밍을 하다 보면 예외 처리와 안전한 코딩이 매우 중요합니다. 특히, UniTask를 사용할 때는 예외를 적절히 처리하고 안전하게 코드를 작성하는 것이 게임의 안정성과 성능에 큰 영향을 미칩니다. 이 강의에서는 UniTask를 이용한 예외 처리와 안전한 코딩에 대해 깊이 있는 실무 예제를 통해 살펴보겠습니다.

## 학습 내용

- UniTask에서의 예외 처리 기법 이해하기
- OperationCanceledException의 활용과 최적화
- 안전한 코딩을 위한 Result<T> 패턴 사용법
- UniTask 사용 시 발생할 수 있는 일반적인 실수와 모범 사례
- 실제 게임 개발 사례를 통한 심화 활용 패턴

## 실제 개발에서 마주하는 문제들

### 비동기 코드에서의 예외 처리

비동기 코드에서 예외 처리는 동기 코드와 마찬가지로 중요합니다. 하지만 비동기 코드에서는 예외가 발생하는 방식이 다르기 때문에 추가적인 주의가 필요합니다. 예를 들어, 다음과 같은 코드에서 UniTask로 비동기 작업을 처리할 때 예외가 발생할 수 있습니다:

```csharp
public class DataLoader : MonoBehaviour
{
    public async UniTask LoadDataAsync()
    {
        try
        {
            var asset = await Resources.LoadAsync<TextAsset>("gameData");
            if (asset == null)
            {
                throw new Exception("Data not found");
            }

            var webRequest = await UnityWebRequest.Get("https://api.game.com/data")
                .SendWebRequest();
            
            if (webRequest.result != UnityWebRequest.Result.Success)
            {
                throw new Exception("Network error: " + webRequest.error);
            }

            Debug.Log("Data loaded successfully");
        }
        catch (Exception ex)
        {
            Debug.LogError($"Error loading data: {ex.Message}");
        }
    }
}
```

이 코드에서는 리소스를 로드하거나 네트워크 요청을 보낼 때 예외가 발생할 수 있으며, 이러한 예외를 try-catch 블록으로 처리하고 있습니다.

## UniTask에서의 예외 처리

### try-catch를 통한 예외 처리

UniTask는 비동기 작업에서 발생하는 예외를 try-catch 블록을 통해 처리할 수 있습니다. 이는 동기 코드에서의 예외 처리와 유사하지만, 비동기 작업이 완료될 때까지 예외가 전파되지 않는다는 점이 다릅니다. 아래 예제에서는 UniTask의 예외 처리를 보여줍니다:

```csharp
public async UniTask<bool> PerformTaskAsync()
{
    try
    {
        await SomeAsyncOperation();
        return true;
    }
    catch (OperationCanceledException)
    {
        Debug.LogWarning("Operation was canceled");
        return false;
    }
    catch (Exception ex)
    {
        Debug.LogError($"Error occurred: {ex.Message}");
        return false;
    }
}
```

### OperationCanceledException의 최적화

OperationCanceledException은 비동기 작업이 취소될 때 발생하는 예외입니다. UniTask에서는 이 예외가 발생하지 않도록 최적화할 수 있습니다. 예를 들어, SuppressCancellationThrow를 사용하면 OperationCanceledException을 피할 수 있습니다:

```csharp
var (isCanceled, _) = await UniTask.DelayFrame(10, cancellationToken: cts.Token).SuppressCancellationThrow();
if (isCanceled)
{
    Debug.Log("Operation was canceled");
}
```

이 방법은 성능을 개선할 수 있으며, 필요하지 않은 경우 예외를 발생시키지 않도록 합니다.

## 안전한 코딩을 위한 패턴

### Result<T> 패턴

Result<T> 패턴은 작업의 성공 여부와 결과를 명확하게 전달할 수 있는 방법입니다. 이 패턴을 사용하면 예외가 발생했을 때도 코드의 흐름을 명확하게 유지할 수 있습니다:

```csharp
public struct Result<T>
{
    public T Value { get; }
    public string Error { get; }
    public bool IsSuccess => Error == null;

    public static Result<T> Success(T value) => new Result<T> { Value = value };
    public static Result<T> Failure(string error) => new Result<T> { Error = error };
}

public async UniTask<Result<int>> SafeDivideAsync(int a, int b)
{
    try
    {
        if (b == 0)
            throw new DivideByZeroException();

        int result = a / b;
        return Result<int>.Success(result);
    }
    catch (Exception ex)
    {
        return Result<int>.Failure(ex.Message);
    }
}
```

이 패턴을 사용하면 예외가 발생해도 처리 로직을 명확하게 유지할 수 있으며, 결과를 기반으로 후속 작업을 결정할 수 있습니다.

## 실습 과제

### 🎯 과제 1: 안전한 데이터 로딩 시스템 구현하기

다음 요구사항을 만족하는 안전한 데이터 로딩 시스템을 구현해보세요:

**요구사항:**
1. 세 가지 데이터를 병렬로 로드
2. 각 데이터 로드는 취소 가능해야 함
3. 로딩 실패 시 오류 메시지 출력
4. 모든 로딩이 완료되면 성공 메시지 출력

**힌트:**
```csharp
public async UniTask<Result<bool>> LoadAllDataAsync(CancellationToken ct)
{
    try
    {
        await UniTask.WhenAll(
            LoadDataAsync("data1", ct),
            LoadDataAsync("data2", ct),
            LoadDataAsync("data3", ct)
        );
        return Result<bool>.Success(true);
    }
    catch (Exception ex)
    {
        Debug.LogError($"Loading failed: {ex.Message}");
        return Result<bool>.Failure(ex.Message);
    }
}
```

### 🎯 과제 2: 비동기 작업의 취소 처리 구현하기

비동기 작업 중 취소 가능한 다운로드 기능을 구현해보세요.

## ❌ 자주 하는 실수들

### 1. CancellationToken 무시
비동기 작업에서 취소 처리를 구현하지 않으면 사용자가 작업을 취소할 수 없습니다. CancellationToken을 항상 전달하여 작업을 취소할 수 있도록 하세요:

```csharp
public async UniTask LongRunningTask(CancellationToken ct)
{
    await UniTask.Delay(10000, cancellationToken: ct);
}
```

### 2. 예외를 잡지 않고 전파
비동기 메서드에서 발생할 수 있는 모든 예외를 처리하여 예기치 않은 종료를 방지합니다:

```csharp
try
{
    await SomeRiskyOperationAsync();
}
catch (Exception ex)
{
    Debug.LogError("Operation failed: " + ex.Message);
}
```

## ✅ 모범 사례

### 1. CancellationToken 사용
항상 CancellationToken을 전달하여 작업이 필요에 따라 취소될 수 있도록 합니다:

```csharp
public async UniTask ProcessDataWithCancellationAsync(CancellationToken ct = default)
{
    await LoadDataAsync(ct);
    await ProcessDataAsync(ct);
    await SaveDataAsync(ct);
}
```

### 2. 예외 처리와 로깅
모든 예외를 적절히 처리하고 로그를 남겨 문제를 추적할 수 있도록 합니다:

```csharp
public async UniTask<Result<T>> ExecuteWithLoggingAsync<T>()
{
    try
    {
        var result = await PerformSensitiveOperationAsync();
        return Result<T>.Success(result);
    }
    catch (Exception ex)
    {
        Debug.LogError($"Operation failed: {ex.Message}");
        return Result<T>.Failure(ex.Message);
    }
}
```

## 요약

- **UniTask에서 예외 처리는 try-catch 블록**을 통해 수행할 수 있습니다.
- **OperationCanceledException을 SuppressCancellationThrow**를 통해 피할 수 있으며, 성능을 최적화할 수 있습니다.
- **Result<T> 패턴**은 작업의 성공 여부와 결과를 명확하게 전달하는 방법입니다.
- **CancellationToken을 활용하여 취소 처리**를 구현하고, 모든 예외를 적절히 처리하여 안전한 코드를 작성하세요.

## 🚀 다음 단계

다음 강의에서는 UniTask를 사용하여 진행 상황을 추적하고 피드백을 제공하는 방법에 대해 알아보겠습니다. 병렬 처리 기술과 결합하여 더욱 효율적인 게임 개발을 진행할 수 있습니다.
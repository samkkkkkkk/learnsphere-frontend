# 8강. 커스텀 비동기 작업

> **강의 설명**: UniTaskCompletionSource 활용, 콜백을 async/await로 변환  
> **생성 일시**: 2025-07-13 19:36:52

---

# 커스텀 비동기 작업의 마스터 - UniTaskCompletionSource 활용하기

Unity 개발에서 비동기 프로그래밍은 필수적입니다. Unity의 Coroutine으로는 복잡한 비동기 작업을 다루기 어렵고, 특히 커스텀 비동기 작업을 생성하는 데 한계가 있습니다. 이번 강의에서는 이러한 한계를 극복하고, UniTask와 UniTaskCompletionSource를 활용하여 고급 커스텀 비동기 작업을 구현하는 방법을 배워보겠습니다.

## 학습 내용

- UniTaskCompletionSource의 개념과 필요성 이해하기
- 콜백 기반 비동기 작업을 async/await 패턴으로 변환하기
- 커스텀 비동기 작업을 구현하는 단계별 과정
- 실제 게임 개발에서의 활용 사례
- 실무 예제를 통해 심화 패턴 이해하기

## 실제 개발에서 마주하는 문제들

### 콜백 기반 비동기 작업의 한계

Unity 개발에서 흔히 접하는 문제 중 하나는 콜백 기반 비동기 작업입니다. 예를 들어, 외부 API 호출이나 파일 읽기 작업은 콜백을 통해 결과를 처리해야 하는 경우가 많습니다. 이런 경우 코드는 복잡해지고 유지보수가 어려워집니다.

```csharp
// 전형적인 콜백 기반 코드 - 복잡하고 가독성이 떨어짐
public class ApiCaller : MonoBehaviour
{
    public void FetchData(Action<string> onSuccess, Action<Exception> onError)
    {
        StartCoroutine(FetchDataCoroutine(onSuccess, onError));
    }

    private IEnumerator FetchDataCoroutine(Action<string> onSuccess, Action<Exception> onError)
    {
        var request = UnityWebRequest.Get("https://api.example.com/data");
        yield return request.SendWebRequest();
        
        if (request.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(new Exception(request.error));
        }
        else
        {
            onSuccess?.Invoke(request.downloadHandler.text);
        }
    }
}
```

이러한 콜백 기반 코드의 문제점들:
- **가독성 저하**: 콜백 중첩으로 코드가 복잡해짐
- **에러 처리 어려움**: 에러 발생 시 적절한 처리 및 흐름 제어가 어려움
- **확장성 부족**: 새로운 기능 추가 시 코드 수정 범위가 큼

## UniTaskCompletionSource란 무엇인가?

UniTaskCompletionSource는 비동기 작업의 완료를 제어할 수 있는 강력한 도구입니다. 이를 통해 기존의 콜백 기반 비동기 작업을 async/await 패턴으로 쉽게 전환할 수 있습니다.

### 핵심 특징들

- **콜백을 async/await로 변환**: 기존의 콜백 기반 코드를 간단하게 변환 가능
- **작업 제어**: 작업의 시작, 완료, 예외 발생 등을 명확하게 제어
- **유연한 사용**: 다양한 비동기 작업에 적용 가능

## UniTaskCompletionSource 활용하기

### 1단계: 기본 개념 이해하기

UniTaskCompletionSource는 비동기 작업의 완료를 제어할 수 있는 TaskCompletionSource와 유사합니다. 이를 사용하여 비동기 작업의 결과를 async/await 패턴으로 처리할 수 있습니다.

### 2단계: 콜백 기반 코드를 UniTask로 변환하기

콜백 기반 코드를 UniTaskCompletionSource를 사용하여 async/await 패턴으로 변환해보겠습니다.

```csharp
using Cysharp.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;
using System;

public class ApiCaller : MonoBehaviour
{
    public async UniTask<string> FetchDataAsync()
    {
        var completionSource = new UniTaskCompletionSource<string>();

        var request = UnityWebRequest.Get("https://api.example.com/data");
        request.SendWebRequest().completed += asyncOperation =>
        {
            if (request.result != UnityWebRequest.Result.Success)
            {
                completionSource.TrySetException(new Exception(request.error));
            }
            else
            {
                completionSource.TrySetResult(request.downloadHandler.text);
            }
        };

        return await completionSource.Task; // 결과를 async/await로 처리
    }
}
```

### 3단계: 커스텀 비동기 작업 구현하기

UniTaskCompletionSource를 사용하여 커스텀 비동기 작업을 구현할 수 있습니다. 예를 들어, 특정 이벤트 발생 시 작업을 완료하는 비동기 작업을 만들어보겠습니다.

```csharp
using UnityEngine;
using Cysharp.Threading.Tasks;
using System;

public class EventTrigger : MonoBehaviour
{
    public async UniTask WaitForEventAsync()
    {
        var completionSource = new UniTaskCompletionSource();

        // 임의의 이벤트 등록
        Action eventHandler = null;
        eventHandler = () =>
        {
            completionSource.TrySetResult();
            // 이벤트 핸들러 해제
            SomeEvent -= eventHandler;
        };

        SomeEvent += eventHandler;

        await completionSource.Task; // 이벤트 발생 시까지 대기
    }

    public event Action SomeEvent; // 임의의 이벤트
}
```

## 실습 과제

### 🎯 과제 1: 사용자 입력 대기

사용자가 특정 키를 입력할 때까지 대기한 후 메시지를 출력하는 커스텀 비동기 작업을 UniTaskCompletionSource를 사용하여 구현해보세요.

**힌트:**
```csharp
public async UniTask WaitForUserInputAsync(KeyCode key)
{
    var completionSource = new UniTaskCompletionSource();

    // Update 메서드에서 키 입력 감지
    void Update()
    {
        if (Input.GetKeyDown(key))
        {
            completionSource.TrySetResult();
        }
    }

    await completionSource.Task;
    Debug.Log($"Key {key} was pressed!");
}
```

### 🎯 과제 2: 타이머 이벤트 구현

지정된 시간 후 이벤트를 발생시키는 타이머를 UniTaskCompletionSource를 사용하여 구현하세요. 타이머가 완료되면 특정 콜백을 실행합니다.

## ❌ 자주 하는 실수들

### 1. UniTaskCompletionSource 잘못된 사용
```csharp
// ❌ 잘못된 방법 - 중복으로 결과 설정
completionSource.TrySetResult("Data");
completionSource.TrySetResult("More Data"); // Exception 발생!

// ✅ 올바른 방법 - 한 번만 결과 설정
if (!completionSource.Task.IsCompleted)
{
    completionSource.TrySetResult("Data");
}
```

### 2. CancellationToken 무시
```csharp
// ❌ 취소 처리 없음
public async UniTask LongOperation()
{
    await UniTask.Delay(10000); // 10초간 취소 불가
}

// ✅ 취소 토큰 사용
public async UniTask LongOperation(CancellationToken ct)
{
    await UniTask.Delay(10000, cancellationToken: ct);
}
```

### 3. 콜백 해제 누락
```csharp
// ❌ 이벤트 핸들러 해제 누락
SomeEvent += Handler;

// ✅ 올바른 방법 - 이벤트 핸들러 해제
SomeEvent += Handler;
SomeEvent -= Handler;
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
        // GameObject가 파괴되면 자동으로 취소됨
        await LongRunningTaskAsync(this.GetCancellationTokenOnDestroy());
    }
}
```

## 요약

- **UniTaskCompletionSource는 비동기 작업의 강력한 도구**로, 콜백 기반 코드를 async/await 패턴으로 변환할 수 있습니다.
- **커스텀 비동기 작업을 구현**하여 더 유연하고 확장 가능한 코드를 작성할 수 있습니다.
- **에러 처리와 작업 제어**가 명확해지며, 코드의 가독성과 유지보수성이 향상됩니다.
- **CancellationToken**을 활용하여 작업을 안전하게 취소할 수 있습니다.

## 🚀 다음 단계

다음 강의에서는 async void와 UniTaskVoid의 차이점을 알아보고, AsyncEnumerable을 활용한 비동기 스트림 처리에 대해 다뤄보겠습니다.
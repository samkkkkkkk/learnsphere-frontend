# 10강. AsyncEnumerable과 스트림

> **강의 설명**: IUniTaskAsyncEnumerable, Async LINQ, 실시간 데이터 스트림 처리  
> **생성 일시**: 2025-07-13 19:38:14

---

# UniTask의 AsyncEnumerable과 스트림 다루기

UniTask의 기능 중 하나인 `AsyncEnumerable`은 실시간 데이터 스트림 처리에 강력한 도구입니다. 이 강의에서는 `IUniTaskAsyncEnumerable`과 관련된 주요 API를 살펴보고, 이를 활용하여 게임 개발에서 실시간 데이터를 효과적으로 처리하는 방법을 알아보겠습니다.

## 학습 내용

- `IUniTaskAsyncEnumerable`의 개념과 필요성 이해하기
- Async LINQ를 활용한 비동기 스트림 처리
- 실시간 데이터 스트림을 활용한 게임 개발 예제
- `UniTaskAsyncEnumerable`의 주요 메서드와 활용 사례

## 실제 개발에서 마주하는 문제들

### 실시간 데이터 처리의 복잡함

게임 개발에서는 실시간으로 변화하는 데이터를 처리해야 하는 경우가 많습니다. 예를 들어, 플레이어의 위치, 적의 상태 변화, 네트워크 이벤트 등입니다. 이러한 데이터는 비동기적으로 발생하고 스트림 형태로 처리해야 할 때가 많습니다. 전통적인 방법으로는 다음과 같은 문제점이 있을 수 있습니다:

- **복잡한 비동기 흐름 제어**: 실시간 데이터를 처리하고 이를 게임 로직에 반영하는 과정이 복잡해질 수 있습니다.
- **성능 저하**: 반복적인 폴링이나 비효율적인 데이터 처리로 인해 성능 문제가 발생할 수 있습니다.
- **코드 유지보수 어려움**: 비동기 흐름이 복잡해질수록 코드의 가독성과 유지보수성이 떨어집니다.

## `IUniTaskAsyncEnumerable`이란 무엇인가?

`IUniTaskAsyncEnumerable`은 UniTask에서 제공하는 비동기 스트림 처리 인터페이스입니다. 이를 통해 실시간 데이터를 비동기적으로 수집하고 처리할 수 있으며, LINQ 스타일의 쿼리로 데이터를 필터링하고 변환하는 작업을 수행할 수 있습니다.

### 핵심 특징들

- **비동기 스트림 처리**: 실시간으로 변하는 데이터를 비동기적으로 처리할 수 있습니다.
- **LINQ 스타일 쿼리**: 데이터를 필터링, 변환, 집계하는 데 LINQ 스타일의 쿼리를 사용할 수 있습니다.
- **Unity와의 통합**: Unity의 생명주기와 자연스럽게 통합되어 게임 개발에 적합합니다.

### 주요 메서드

- `Where`: 조건에 맞는 데이터를 필터링합니다.
- `Select`: 데이터를 변환합니다.
- `ForEachAsync`: 스트림의 각 요소에 대해 작업을 수행합니다.
- `ToArrayAsync`: 스트림을 배열로 변환합니다.

## 실무 예제: 게임 내 실시간 이벤트 스트림 처리

### 1단계: 네임스페이스 추가하기

```csharp
using Cysharp.Threading.Tasks;
using Cysharp.Threading.Tasks.Linq;
```

### 2단계: 스트림 생성하기

게임에서 실시간 이벤트를 스트림으로 처리하는 예제를 만들어 보겠습니다. 예를 들어, 플레이어의 입력을 실시간으로 처리하여 게임 오브젝트의 움직임을 제어할 수 있습니다.

```csharp
public class PlayerMovement : MonoBehaviour
{
    public float speed = 5.0f;

    private async UniTaskVoid Start()
    {
        // 플레이어 입력 스트림 생성
        var inputStream = UniTaskAsyncEnumerable.EveryUpdate()
            .Select(_ => new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical")))
            .Where(input => input.magnitude > 0.1f);

        // 스트림을 통해 입력 처리
        await inputStream.ForEachAsync(input =>
        {
            transform.Translate(input * speed * Time.deltaTime);
        });
    }
}
```

### 3단계: 비동기 스트림 활용하기

플레이어의 입력을 비동기적으로 처리하여 실시간으로 움직임을 제어하고 있습니다. 이처럼 `IUniTaskAsyncEnumerable`을 사용하면 복잡한 비동기 흐름을 간단하게 관리할 수 있습니다.

### 4단계: 고급 스트림 처리

이제 더 복잡한 스트림 처리 예제를 살펴보겠습니다. 게임 내 이벤트 로그를 실시간으로 수집하여 UI에 표시하는 작업을 구현해봅시다.

```csharp
public class EventLogger : MonoBehaviour
{
    private async UniTaskVoid Start()
    {
        // 이벤트 스트림 생성
        var eventStream = GenerateEventStream();

        // 이벤트를 실시간으로 UI에 표시
        await eventStream.ForEachAsync(log =>
        {
            Debug.Log(log);
            // UI 업데이트 로직 추가
        });
    }

    private IUniTaskAsyncEnumerable<string> GenerateEventStream()
    {
        return UniTaskAsyncEnumerable.Create<string>(async (writer, token) =>
        {
            for (int i = 0; i < 10; i++)
            {
                await UniTask.Delay(TimeSpan.FromSeconds(1), cancellationToken: token);
                await writer.YieldAsync($"Event {i}");
            }
        });
    }
}
```

## 실습 과제

### 🎯 과제 1: 비동기 데이터 필터링

`IUniTaskAsyncEnumerable`을 사용하여 비동기적으로 숫자 데이터를 수집하고, 짝수만 필터링하여 출력하는 프로그램을 작성해보세요.

```csharp
public async UniTask FilterEvenNumbersAsync()
{
    var numberStream = UniTaskAsyncEnumerable.Range(1, 100);

    await numberStream
        .Where(num => num % 2 == 0)
        .ForEachAsync(num => Debug.Log($"Even Number: {num}"));
}
```

### 🎯 과제 2: 실시간 UI 업데이트

실시간으로 변경되는 게임 점수를 `IUniTaskAsyncEnumerable`을 사용하여 UI에 갱신하는 시스템을 구현해보세요.

## ❌ 자주 하는 실수들

### 1. 스트림을 잘못 구독하기

```csharp
// ❌ 잘못된 방법 - 스트림을 여러 번 구독하면 불필요한 자원이 소모됨
var stream = GenerateEventStream();
await stream.ForEachAsync(_ => Debug.Log("First Subscription"));
await stream.ForEachAsync(_ => Debug.Log("Second Subscription"));

// ✅ 올바른 방법 - 스트림을 적절히 관리
var cachedStream = stream.ToArrayAsync();
await cachedStream.ForEachAsync(_ => Debug.Log("Single Subscription"));
```

### 2. 잘못된 스트림 종료 처리

```csharp
// ❌ 취소 토큰을 사용하지 않음
public async UniTask ProcessEventsAsync()
{
    var stream = GenerateEventStream();
    await stream.ForEachAsync(_ => Debug.Log("Processing Event"));
}

// ✅ 취소 토큰 사용
public async UniTask ProcessEventsAsync(CancellationToken token)
{
    var stream = GenerateEventStream();
    await stream.ForEachAsync(_ => Debug.Log("Processing Event"), token);
}
```

## ✅ 모범 사례

### 1. 비동기 스트림의 적절한 사용

비동기 스트림을 사용할 때는 항상 취소 토큰을 사용하여 스트림이 올바르게 종료되도록 해야 합니다.

```csharp
public async UniTask ProcessDataAsync(CancellationToken ct = default)
{
    var dataStream = GetDataStream();
    await dataStream.ForEachAsync(data => Process(data), ct);
}
```

### 2. 스트림 변환과 필터링

`IUniTaskAsyncEnumerable`을 활용하여 데이터를 변환하고 필터링하는 작업을 간단하게 수행할 수 있습니다.

```csharp
public async UniTask FilterAndTransformStreamAsync()
{
    var dataStream = GetDataStream();

    await dataStream
        .Where(data => data.IsValid)
        .Select(data => Transform(data))
        .ForEachAsync(result => Debug.Log($"Processed Data: {result}"));
}
```

## 요약

- `IUniTaskAsyncEnumerable`은 실시간 데이터 스트림 처리를 위한 강력한 도구입니다.
- Async LINQ 쿼리를 사용하여 데이터를 필터링하고 변환하는 작업을 간단하게 처리할 수 있습니다.
- 실시간 스트림 처리는 게임 개발에서 필수적인 요소이며, UniTask를 통해 효율적으로 구현할 수 있습니다.
- 취소 토큰을 활용하여 스트림의 수명을 관리하고, 비동기 흐름을 적절히 제어할 수 있습니다.

## 🚀 다음 단계

다음 강의에서는 Unity 이벤트와 UI를 UniTask와 연동하여 비동기적으로 처리하는 방법을 다룹니다. 또한, 디버깅과 성능 최적화에 대한 팁도 제공할 예정이니 기대해주세요!
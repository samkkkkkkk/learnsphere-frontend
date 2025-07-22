# 2강. 시간과 프레임 제어

> **강의 설명**: UniTask.Delay, DelayFrame, Yield, NextFrame, ignoreTimeScale  
> **생성 일시**: 2025-07-13 19:23:33

---

# UniTask로 시간과 프레임 제어하기

게임 개발에서 시간과 프레임 제어는 매우 중요한 주제입니다. 특히, Unity에서의 비동기 작업은 프레임 기반으로 동작하기 때문에 프레임 제어를 적절히 활용하는 것이 성능의 중요한 요소가 됩니다. 이번 강의에서는 UniTask의 다양한 기능을 활용하여 시간과 프레임을 효과적으로 제어하는 방법을 배워보겠습니다.

## 학습 내용

- UniTask.Delay, UniTask.DelayFrame, UniTask.Yield, UniTask.NextFrame의 효과적인 사용법 이해하기
- PlayerLoop를 활용한 시간 제어
- ignoreTimeScale 옵션을 활용하여 시간 흐름을 무시하는 방법
- 실무에서의 시간 및 프레임 제어 패턴

## 실제 개발에서 마주하는 문제들

### 비효율적인 시간 제어

게임 개발에서 시간 제어는 매우 중요합니다. 그러나 부정확하거나 비효율적으로 시간을 제어하면 게임의 퍼포먼스에 악영향을 미칠 수 있습니다. 다음은 전형적인 Coroutine을 사용한 시간 제어 코드입니다:

```csharp
public IEnumerator WaitAndExecute()
{
    yield return new WaitForSeconds(2f); // 시간 흐름에 의해 비동기 작업이 지연됨
    ExecuteAction(); // 특정 액션 수행
}
```

이 코드의 문제점은 다음과 같습니다:
- **시간 흐름에 의존**: 게임의 시간 흐름(Time.timeScale)에 따라 대기 시간이 달라짐
- **성능 이슈**: Coroutine의 구조상 메모리 할당이 빈번하게 발생

## UniTask로 문제 해결하기

UniTask의 다양한 API를 활용하면 이러한 문제들을 효과적으로 해결할 수 있습니다.

### 1단계: UniTask.Delay로 시간 제어하기

UniTask.Delay를 사용하면 지정된 시간 동안 대기할 수 있습니다. 이때, `ignoreTimeScale` 옵션을 사용하여 시간 흐름을 무시할 수 있습니다.

```csharp
using Cysharp.Threading.Tasks;

public async UniTask WaitAndExecuteAsync()
{
    // ignoreTimeScale을 true로 설정하여 시간 흐름 무시
    await UniTask.Delay(TimeSpan.FromSeconds(2), ignoreTimeScale: true);
    ExecuteAction();
}
```

### 2단계: UniTask.DelayFrame으로 프레임 제어하기

프레임 기반 대기 작업은 UniTask.DelayFrame을 사용하여 구현할 수 있습니다.

```csharp
public async UniTask DelayFramesAndExecuteAsync()
{
    // 10 프레임 대기
    await UniTask.DelayFrame(10);
    ExecuteAction();
}
```

### 3단계: UniTask.Yield와 UniTask.NextFrame 사용하기

때로는 다음 프레임까지 기다리거나 특정 시점에 작업을 실행해야 할 때가 있습니다. UniTask.Yield와 UniTask.NextFrame은 이러한 작업을 간단하게 만듭니다.

```csharp
public async UniTask ExecuteNextFrameAsync()
{
    await UniTask.NextFrame(); // 다음 프레임까지 대기
    ExecuteAction();
}

public async UniTask ExecuteAfterYieldAsync()
{
    await UniTask.Yield(); // 다음 PlayerLoop 단계까지 대기
    ExecuteAction();
}
```

### 4단계: PlayerLoop를 활용한 고급 제어

PlayerLoop를 활용하면 더욱 세밀한 시간 제어가 가능합니다. UniTask는 다양한 PlayerLoopTiming 옵션을 제공하여 특정 업데이트 단계에 작업을 수행할 수 있습니다.

```csharp
public async UniTask ExecutePreUpdateAsync()
{
    await UniTask.Yield(PlayerLoopTiming.PreUpdate); // PreUpdate 단계까지 대기
    ExecuteAction();
}
```

## 실습 과제

### 🎯 과제 1: 프레임 기반 애니메이션 구현

다음 요구사항을 만족하는 프레임 기반 애니메이션 시스템을 UniTask로 구현해보세요:

**요구사항:**
1. 애니메이션 5프레임을 순차적으로 실행
2. 각 프레임 사이에 2프레임 대기
3. 애니메이션 완료 시 메시지 출력

**힌트:**
```csharp
public async UniTask AnimateAsync()
{
    for (int i = 0; i < 5; i++)
    {
        // 애니메이션 프레임 출력
        Debug.Log($"Animating frame {i + 1}");
        
        // 2 프레임 대기
        await UniTask.DelayFrame(2);
    }
    
    Debug.Log("Animation complete!");
}
```

### 🎯 과제 2: ignoreTimeScale 활용

게임의 시간 흐름을 무시하고 일정한 간격으로 이벤트를 발생시키는 시스템을 구현해보세요.

## ❌ 자주 하는 실수들

### 1. 시간 흐름에 의존한 대기

```csharp
// ❌ 잘못된 방법
public IEnumerator WaitForRealTime()
{
    yield return new WaitForSecondsRealtime(2f); // 의도치 않게 시간 흐름에 의존함
}

// ✅ 올바른 방법
public async UniTask WaitForRealTimeAsync()
{
    await UniTask.Delay(TimeSpan.FromSeconds(2), ignoreTimeScale: true);
}
```

### 2. PlayerLoop를 고려하지 않은 실행

```csharp
// ❌ 잘못된 방법 - 특정 PlayerLoop 단계에서 실행되지 않음
public async UniTask ExecuteWithoutPlayerLoop()
{
    await UniTask.Yield();
    ExecuteAction();
}

// ✅ 올바른 방법
public async UniTask ExecuteWithPlayerLoop()
{
    await UniTask.Yield(PlayerLoopTiming.Update); // Update 단계에서 실행
    ExecuteAction();
}
```

## ✅ 모범 사례

### 1. 프레임 기반 대기 활용

```csharp
public async UniTask FrameBasedOperationAsync()
{
    await UniTask.DelayFrame(60); // 1초 대기에 해당하는 60프레임 대기
    ExecuteAction();
}
```

### 2. ignoreTimeScale과 함께 UniTask.Delay 사용

```csharp
public async UniTask UnscaledTimeOperationAsync()
{
    await UniTask.Delay(TimeSpan.FromSeconds(5), ignoreTimeScale: true); // 실제 시간 기준 5초 대기
    ExecuteAction();
}
```

### 3. PlayerLoop 기반으로 작업 실행

```csharp
public async UniTask ExecuteDuringFixedUpdateAsync()
{
    await UniTask.Yield(PlayerLoopTiming.FixedUpdate); // FixedUpdate 단계에서 실행
    ExecuteAction();
}
```

## 요약

- **UniTask를 활용한 시간 및 프레임 제어**는 게임 개발에 필수적인 기술입니다.
- **UniTask.Delay와 UniTask.DelayFrame**을 사용하여 시간과 프레임 기반 대기를 효과적으로 관리할 수 있습니다.
- **PlayerLoop와 ignoreTimeScale**을 활용하여 더욱 세밀한 제어가 가능합니다.
- **올바른 UniTask API 사용**으로 성능을 최적화하고 유지보수가 용이한 코드를 작성할 수 있습니다.

## 🚀 다음 단계

다음 강의에서는 Unity의 AsyncOperation을 완전 정복하는 방법을 다룰 것입니다. UniTask를 통해 다양한 비동기 작업을 더욱 효율적으로 처리하는 방법을 배워보세요.
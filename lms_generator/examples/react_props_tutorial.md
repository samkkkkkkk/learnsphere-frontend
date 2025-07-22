# 컴포넌트에 props 전달하기

React 컴포넌트는 props를 이용해 서로 통신합니다. 모든 부모 컴포넌트는 props를 줌으로써 몇몇의 정보를 자식 컴포넌트에게 전달할 수 있습니다. props는 HTML 어트리뷰트를 생각나게 할 수도 있지만, 객체, 배열, 함수를 포함한 모든 JavaScript 값을 전달할 수 있습니다.

## 학습 내용

- 컴포넌트에 props를 전달하는 방법
- 컴포넌트에서 props를 읽는 방법
- props의 기본값을 지정하는 방법
- 컴포넌트에 JSX를 전달하는 방법
- 시간에 따라 props가 변하는 방식

## 친숙한 props

props는 JSX 태그에 전달하는 정보입니다. 예를 들어, `className`, `src`, `alt`, `width`, `height`는 `<img>` 태그에 전달할 수 있습니다.

```jsx
function Avatar() {
  return (
    <img
      className="avatar"
      src="https://i.imgur.com/1bX5QH6.jpg"
      alt="Lin Lanying"
      width={100}
      height={100}
    />
  );
}
```

`<img>` 태그에 전달할 수 있는 props는 미리 정의되어 있습니다. (ReactDOM은 HTML 표준을 준수합니다.) 자신이 생성한 `<Avatar>`와 같은 어떤 컴포넌트든 props를 전달할 수 있습니다. 방법은 다음과 같습니다.

## 컴포넌트에 props 전달하기

아래 코드에서 `Profile` 컴포넌트는 자식 컴포넌트인 `Avatar`에 어떠한 props도 전달하지 않습니다.

```jsx
export default function Profile() {
  return (
    <Avatar />
  );
}
```

다음 두 단계에 걸쳐 `Avatar`에 props를 전달할 수 있습니다.

### 1단계: 자식 컴포넌트에 props 전달하기

먼저, `Avatar`에 몇몇 props를 전달합니다. 예를 들어 `person` (객체)와 `size` (숫자)를 전달해보겠습니다.

```jsx
export default function Profile() {
  return (
    <Avatar
      person={{ name: 'Lin Lanying', imageId: '1bX5QH6' }}
      size={100}
    />
  );
}
```

> **💡 중요합니다!**
> 
> `person=` 뒤에 있는 이중 괄호가 혼란스럽다면, JSX 중괄호 안의 객체라고 기억하시면 됩니다.

이제 `Avatar` 컴포넌트 내 props를 읽을 수 있습니다.

### 2단계: 자식 컴포넌트 내부에서 props 읽기

이러한 props는 `function Avatar` 바로 뒤에 있는 `{`와 `}` 안에 그들의 이름인 `person`, `size` 등을 쉼표로 구분함으로써 읽을 수 있습니다. 이렇게 하면 `Avatar` 코드 내에서 변수를 사용하는 것처럼 사용할 수 있습니다.

```jsx
function Avatar({ person, size }) {
  // person과 size는 이곳에서 사용가능합니다.
}
```

`Avatar`에 렌더링을 위해 `person`과 `size` props를 사용하는 로직을 추가하면 완료됩니다.

```jsx
import { getImageUrl } from './utils.js';

function Avatar({ person, size }) {
  return (
    <img
      className="avatar"
      src={getImageUrl(person)}
      alt={person.name}
      width={size}
      height={size}
    />
  );
}
```

이제 `Avatar`를 다른 props를 이용해 다양한 방식으로 렌더링하도록 구성할 수 있습니다. 값을 조정해 보세요!

props를 사용하면 부모 컴포넌트와 자식 컴포넌트를 독립적으로 생각할 수 있습니다. 예를 들어, `Avatar`가 props를 어떻게 사용하는지 생각할 필요 없이 `Profile`의 `person` 또는 `size` props를 수정할 수 있습니다. 마찬가지로 `Profile`을 보지 않고도 `Avatar`가 props를 사용하는 방식을 바꿀 수 있습니다.

props는 조절할 수 있는 손잡이라고 생각하면 됩니다. props는 함수의 인수와 동일한 역할을 합니다. 사실 props는 컴포넌트에 대한 유일한 인자입니다! React 컴포넌트 함수는 하나의 인자, 즉 props 객체를 받습니다.

```jsx
function Avatar(props) {
  let person = props.person;
  let size = props.size;
  // ...
}
```

보통은 전체 props 자체를 필요로 하지는 않기에, 개별 props로 구조 분해 할당합니다.

## prop의 기본값 지정하기

값이 지정되지 않았을 때, prop에 기본값을 주길 원한다면, 변수 바로 뒤에 `=`과 함께 기본값을 넣어 구조 분해 할당을 해줄 수 있습니다.

```jsx
function Avatar({ person, size = 100 }) {
  // ...
}
```

이제 `<Avatar person={...} />`가 `size` prop이 없이 렌더링 된다면, `size`는 `100`으로 설정됩니다.

이 기본값은 `size` prop이 없거나 `size={undefined}`로 전달될 때 사용됩니다. 그러나 `size={null}` 또는 `size={0}`으로 전달된다면, 기본값은 사용되지 않습니다.

> **⚠️ 주의하세요!**
> 
> props를 선언할 때 `(` 및 `)` 안에 `{` 및 `}` 쌍을 놓치지 마세요
> 
> 이 문법을 "구조 분해 할당"이라고 부르며 함수 매개변수의 속성과 동등합니다.

## JSX spread 문법으로 props 전달하기

때때로 전달되는 props는 반복적입니다.

```jsx
function Profile({ person, size, isSepia, thickBorder }) {
  return (
    <div className="card">
      <Avatar
        person={person}
        size={size}
        isSepia={isSepia}
        thickBorder={thickBorder}
      />
    </div>
  );
}
```

반복적인 코드는 가독성을 높일 수 있다는 점에서 잘못된 것은 아닙니다. 하지만 때로는 간결함이 중요할 때도 있습니다. `Profile`이 `Avatar`에서 하는 것처럼, 일부 컴포넌트는 그들의 모든 props를 자식 컴포넌트에 전달합니다.

props를 직접 사용하지 않기 때문에 보다 간결한 "spread" 문법을 사용하는 것이 합리적일 수 있습니다.

```jsx
function Profile(props) {
  return (
    <div className="card">
      <Avatar {...props} />
    </div>
  );
}
```

이렇게 하면 `Profile`의 모든 props를 각각의 이름을 나열하지 않고 `Avatar`로 전달합니다.

**spread 문법은 제한적으로 사용하세요.** 다른 모든 컴포넌트에 이 구문을 사용한다면 문제가 있는 것입니다. 이는 종종 컴포넌트들을 분할하여 자식을 JSX로 전달해야 함을 나타냅니다. 더 자세히 알아봅시다!

## 자식을 JSX로 전달하기

내장된 브라우저 태그는 중첩하는 것이 일반적입니다.

```jsx
<div>
  <img />
</div>
```

때로는 같은 방식으로 자체 컴포넌트를 중첩하고 싶을 때가 있습니다.

```jsx
<Card>
  <Avatar />
</Card>
```

JSX 태그 내에 콘텐츠를 중첩하면, 부모 컴포넌트는 해당 콘텐츠를 `children`이라는 prop으로 받을 것입니다. 예를 들어, 아래의 `Card` 컴포넌트는 `<Avatar />`로 설정된 `children` prop을 받아 이를 래퍼 div에 렌더링 할 것입니다.

```jsx
import Avatar from './Avatar.js';

function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

export default function Profile() {
  return (
    <Card>
      <Avatar
        size={100}
        person={{ 
          name: 'Katsuko Saruhashi',
          imageId: 'YfeOqp2'
        }}
      />
    </Card>
  );
}
```

`<Card>` 내부의 `<Avatar>`를 텍스트로 바꾸어 `<Card>` 컴포넌트가 중첩된 콘텐츠를 어떻게 감싸는지 확인해 보세요. 그 내부에서 무엇이 렌더링 되는지 "알" 필요는 없습니다. 이 유연한 패턴은 많은 곳에서 볼 수 있습니다.

`children` prop을 가지고 있는 컴포넌트는 부모 컴포넌트가 임의의 JSX로 "채울" 수 있는 "구멍"이 있는 것으로 생각할 수 있습니다. 패널, 그리드 등의 시각적 래퍼에 종종 `children` prop을 사용합니다.

## 시간에 따라 props가 변하는 방식

아래의 `Clock` 컴포넌트는 부모 컴포넌트로부터 `color`와 `time`이라는 두 가지 props를 받습니다. (부모 컴포넌트의 코드는 아직 자세히 다루지 않을 state를 사용하기 때문에 생략합니다.)

```jsx
export default function Clock({ color, time }) {
  return (
    <h1 style={{ color: color }}>
      {time}
    </h1>
  );
}
```

이 예시는 **컴포넌트가 시간에 따라 다른 props를 받을 수 있음**을 보여줍니다. Props는 항상 고정되어 있지 않습니다! 여기서 `time` prop은 매초 변경되고, `color` prop은 다른 색상을 선택하면 변경됩니다. Props는 컴포넌트의 데이터를 처음에만 반영하는 것이 아니라 모든 시점에 반영합니다.

그러나 props는 컴퓨터 과학에서 "변경할 수 없다"라는 의미의 **불변성**을 가지고 있습니다. 컴포넌트가 props를 변경해야 하는 경우(예: 사용자의 상호작용이나 새로운 데이터에 대한 응답), 부모 컴포넌트에 다른 props, 즉 새로운 객체를 전달하도록 "요청"해야 합니다! 그러면 이전의 props는 버려지고, 결국 자바스크립트 엔진은 기존 props가 차지했던 메모리를 회수하게 됩니다.

**"props 변경"을 시도하지 마세요.** 선택한 색을 변경하는 등 사용자 입력에 반응해야 하는 경우에는 "set state"가 필요할 것입니다.

## 요약

- Props를 전달하려면 HTML 어트리뷰트를 사용할 때와 마찬가지로 JSX에 props를 추가합니다.
- Props를 읽으려면 `function Avatar({ person, size })` 구조 분해 할당 문법을 사용합니다.
- `size = 100`과 같은 기본값을 지정할 수 있으며, 이는 누락되거나 `undefined`인 props에 사용됩니다.
- 모든 props를 `<Avatar {...props} />`로 전달할 수 있습니다. JSX spread 문법을 사용할 수 있지만 과도하게 사용하지 마세요!
- `<Card><Avatar /></Card>`와 같이 중첩된 JSX는 `Card` 컴포넌트의 자식 컴포넌트로 나타납니다.
- Props는 읽기 전용 스냅샷으로, 렌더링 할 때마다 새로운 버전의 props를 받습니다.
- Props는 변경할 수 없습니다. 상호작용이 필요한 경우 state를 설정해야 합니다.

## 챌린지

### 챌린지 1: 컴포넌트 추출하기

이 `Gallery` 컴포넌트에는 두 가지 프로필에 대한 몇 가지 비슷한 마크업이 포함되어 있습니다. 중복을 줄이기 위해 `Profile` 컴포넌트를 추출해 보세요. 어떤 props를 전달할지 골라야 할 수 있습니다.

```jsx
import { getImageUrl } from './utils.js';

export default function Gallery() {
  return (
    <div>
      <h1>Notable Scientists</h1>
      <section className="profile">
        <h2>Maria Skłodowska-Curie</h2>
        <img
          className="avatar"
          src={getImageUrl('szV5sdG')}
          alt="Maria Skłodowska-Curie"
          width={70}
          height={70}
        />
        <ul>
          <li>
            <b>Profession: </b> 
            physicist and chemist
          </li>
          <li>
            <b>Awards: 4 </b> 
            (Nobel Prize in Physics, Nobel Prize in Chemistry, Davy Medal, Matteucci Medal)
          </li>
          <li>
            <b>Discovered: </b>
            polonium (chemical element)
          </li>
        </ul>
      </section>
      <section className="profile">
        <h2>Katsuko Saruhashi</h2>
        <img
          className="avatar"
          src={getImageUrl('YfeOqp2')}
          alt="Katsuko Saruhashi"
          width={70}
          height={70}
        />
        <ul>
          <li>
            <b>Profession: </b> 
            geochemist
          </li>
          <li>
            <b>Awards: 2 </b> 
            (Miyake Prize for geochemistry, Tanaka Prize)
          </li>
          <li>
            <b>Discovered: </b>
            a method for measuring carbon dioxide in seawater
          </li>
        </ul>
      </section>
    </div>
  );
}
```
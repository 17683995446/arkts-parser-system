export class BeforeUnclosed {
  method() {
    const str = "这个字符串没有闭合...
}

export class ThisShouldNotBeFound {
  secretMethod() { return 'should not'; }
}

export class AfterUnclosed {
  realMethod() { return 'real'; }
}
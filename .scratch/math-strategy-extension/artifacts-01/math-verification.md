# Geometry mathematical verification (not behavior replay)

Date: 2026-11-12. Node v24.15.0. Executed in this worktree with `node --input-type=module` and stdout/stderr captured by `tee`. The successful input below produced [exact-check output](<math-check-exact.txt>).

```js
import assert from 'node:assert/strict'
assert.deepEqual([8*6-3*2,8*4+5*2,5*6+3*4],[42,42,42])
assert.equal(10*7-4*3,58)
const area=([ax,ay],[bx,by],[cx,cy])=>Math.abs((bx-ax)*(cy-ay)-(by-ay)*(cx-ax))/2
const A=[0,0],B=[6,0]
assert.deepEqual([area(A,B,[-2,4]),area(A,B,[3,4])],[12,12])
assert.equal(area(A,B,[3,5]),15)
const sidesSquared=(C)=>[36,C[0]**2+C[1]**2,(C[0]-6)**2+C[1]**2].sort((a,b)=>a-b)
assert.deepEqual(sidesSquared([0,4]),[16,36,52])
assert.deepEqual(sidesSquared([3,4]),[25,25,36])
assert.notDeepEqual(sidesSquared([0,4]),sidesSquared([3,4]))
assert.ok(52>36) // sqrt52 > 6, hence 10+sqrt52 > 16.
```

The stdout also contains explanatory PASS labels; assertions above are the mathematical operations, not a synthetic teaching transcript. Manual geometric review: horizontal strips (8×4,5×2) and vertical strips (5×6,3×4) partition the L-region without internal overlap or omission. For fixed base AB on y=0, y=4 supplies perpendicular height even at x=−2 outside AB. Different squared side multisets exclude congruence. The exact perimeter comparison excludes equal perimeter. Missing parallelism/height is an information gap, not a numerical case to prove by coordinates.

## Initial failed attempt

The [initial stdout](<math-check.txt>) stops after four labels. Its fifth assertion used exact floating equality between `Math.hypot(6,4)` and `Math.sqrt(52)` and failed: 7.211102550927979 versus 7.211102550927978. Stderr was returned in the tool transcript, not captured by that first tee. This was a numerical-check mistake, not a geometry-rule failure; the retry uses exact squared integer lengths. The first shell did not stop at its failed pipeline and returned the subsequent full-test command's status; the retry used `set -euo pipefail`. No failed attempt is counted as passing.

No model endpoint, provider, generation parameters, student response or storage operation participated in these mathematical checks. They establish neither a multi-turn teacher behavior result nor real learning effectiveness.

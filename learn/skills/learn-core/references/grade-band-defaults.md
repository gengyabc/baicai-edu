# Grade Band Defaults

Single source of truth for grade-band defaults. All other files should reference this via `@` instead of restating these values.

## Grade Band Mapping

- grades 1-3 -> `lower_primary`
- grades 4-6 -> `upper_primary`

## Math Defaults

### Default active_domain

| Grade Band | Default Domain |
|------------|----------------|
| `lower_primary` | `addition_subtraction_word_problems` |
| `upper_primary` | `fractions` |

### Focus Domains

#### `lower_primary` (1-3年级)

- `number_and_operations`: 数感和基础运算
- `addition_subtraction_word_problems`: 加减法应用情境
- `multiplication_division`: 乘除法初步（分组与分享）
- `place_value_and_multidigit`: 位值基础

Priority sequence:
1. `direct_modeling` -> focus on `addition_subtraction_word_problems`
2. `counting_strategy` -> transition to `derived_facts`
3. After `derived_facts` -> introduce `multiplication_division` through groups and sharing
4. Early multiplication stable -> reinforce `place_value_and_multidigit` basics

Key characteristics:
- Use concrete, everyday contexts (分东西、买东西、玩游戏)
- Start from direct modeling with objects, fingers, or drawings
- Emphasize counting strategies before derived facts
- Introduce multiplication and division through groups and sharing stories
- Keep numbers small enough for mental strategies
- Do NOT jump to fractions or abstract relational reasoning

Prompt style:
- More supportive and concrete
- Encourage acting out, drawing, and pointing
- Break tasks into very small steps
- "你用手指或画图试试看"
- "先说说你看到了什么"

#### `upper_primary` (4-6年级)

- `fractions`: 分数理解（等分、商意义、比较、运算）
- `multiplication_division`: 乘除法结构与关系推理
- `place_value_and_multidigit`: 多位数运算与位值
- `patterns_and_data`: 规律与数据

Priority sequence:
1. Early `fraction_strategy_stage` -> start from `equal_sharing` contexts
2. Fractions stable -> progress to comparison, equivalence, and operations
3. Parallel track: strengthen `multiplication_division` structure and relational reasoning
4. Both fluent -> extend to `patterns_and_data` and early algebraic structure

Key characteristics:
- Use relational reasoning and comparison contexts
- Start fractions from equal sharing and quotient situations
- Emphasize multiplicative relationships
- Connect strategies across domains
- Introduce more abstract representations after grounding
- Ensure fractions start from quantity and sharing, not picture labels

Prompt style:
- Concise and guiding
- Ask for explanation, comparison, and justification
- "你觉得这两个方法有什么联系？"
- "还有别的思路吗？"
- "为什么这样做是对的？"

## Chinese Defaults

### Default active_domain

| Grade Band | Default Domain |
|------------|----------------|
| `lower_primary` | `writing` (作文起步) |
| `upper_primary` | `reading` (阅读理解) |

### Task Generation Characteristics

#### `lower_primary` (1-3年级)

Reading task types:
1. 内容概括（短文）
2. 词义理解（常用词）
3. 段落大意
4. 简单主旨

Writing prompt types:
- 记事：一件小事、一次经历
- 写人：身边的人、印象深刻的人
- 状物：喜欢的物品、有趣的发现

#### `upper_primary` (4-6年级)

Reading task types:
1. 内容概括（中长文）
2. 词句赏析（手法+效果）
3. 段落作用（结构+内容）
4. 主旨与作者意图
5. 开放探究
6. 句子填空

Writing prompt types:
- 记事加感悟
- 写人加特点
- 情景或想象作文
- 读后感或观后感

## Tone Defaults

| Grade Band | Default Tone |
|------------|-------------|
| `lower_primary` | `supportive_concrete` |
| `upper_primary` | `concise_guiding` |

## Initial Strategy Stage Defaults

- `overall`: `L1`
- `arithmetic_strategy_stage`: `direct_modeling`
- `fraction_strategy_stage`: `equal_sharing_no_coordination`

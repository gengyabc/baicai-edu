



# **儿童数学教育 Skill 体系：科学性与教育学审核**

我将这次审核定位为一次**教育科学与认知科学审查**，重点判断你的 Skill 体系是否真正有利于儿童数学理解、推理能力发展和长期学习，而不只是判断规则是否完整、架构是否合理。

从压缩包的组织和核心教学规则来看，你的体系已经具有比较清晰的教育设计思路：

- **低年级数学**：以 CGI（Cognitively Guided Instruction，认知指导教学）为主要依据，重视数量关系、儿童自发策略和数学表达。
- **高年级数学**：从 CGI 扩展到代数思维、证明、几何推理、数学建模、组合计数、不变量和极值等领域。
- **共同教学机制**：强调先观察学生思考，再提供针对性支架；区分独立表现与提示后表现；通过少量有目的的练习收集学习证据。
- **学习支持系统**：将数学教学与通用的学习会话、学习状态、学习动机支持及学习记录机制连接起来。

这些方向整体上具有较好的教育学依据。

但这里必须区分三个不同的问题：

1. **理论合理性**：教学规则能否从认知科学和数学教育研究中找到依据？
2. **教学有效性**：这些规则是否能在真实教学中促进理解、迁移和独立解题？
3. **智能体执行可靠性**：LLM 能否稳定、准确地执行这些规则，而不会把形式上的教学流程误认为真正的学习？

前者可以通过文献和规则审查判断；后两者还需要情境测试与学生学习数据，不能仅凭 Skill 文件认定已经有效。

## **一、总体评价**

基于文件内容的专家判断，非实证测评得分

教育理论合理性

## **较高**

核心原则与已有研究相容

数学思维培养

## **较高**

高年级方法覆盖较全面

认知负荷控制

## **中等偏高**

需要加强显式教学条件

个体适应机制

## **中等**

有规则，但缺少校准

学习效果验证

## **证据不足**

测试情境不等于真实学习成效

LLM 教学可靠性

## **待验证**

需要独立评测和错误控制

**总体结论：可以作为儿童数学智能教学系统的研究原型，但尚不宜将所有教学规则视为经过科学验证的最佳实践。**

特别值得肯定的是，高年级数学没有把 CGI 当作唯一方法，而是依据数学任务选择不同教学方式。这比统一采用“启发式提问”更加合理。

我认为最需要关注的四个问题是：

1. **过度引导的风险**：持续要求儿童自己发现，可能增加不必要的认知负荷。
2. **理解与熟练的关系**：重视解释和推理是正确的，但程序性熟练、数学事实自动化也不可忽视。
3. **学习证据的解释**：回答正确、能解释、独立完成和真正迁移是不同维度，不能简单归并为单一等级。
4. **规则的适用条件**：一些教学规则在特定条件下有效，但当前写法可能让 LLM 把它们执行成普遍要求。

## **二、理论基础审核**

| 理论或方法        | 当前应用情况      | 审核判断             |
| ------------ | ----------- | ---------------- |
| CGI 认知指导教学   | 低年级核心，高年级辅助 | 适合重视儿童策略的数学教学    |
| CPA 具体—图像—抽象 | 高年级概念教学     | 合理，但不能机械要求三个阶段   |
| Pólya 问题解决   | 多步骤与陌生问题    | 合理，需避免固定流程化      |
| 支架与逐步撤除      | 两个学段均有      | 方向正确，需更好判断何时直接讲解 |
| 变式与对比        | 关系辨析、迁移     | 有较强依据，需控制变化因素    |
| 早期代数思维       | 等式、变量、规律    | 符合现代数学教育方向       |
| 探究与证明        | 高年级奥数和证明    | 有价值，但必须与显式指导结合   |
| 形成性评价        | 诊断、练习、学习记录  | 合理，证据解释需要进一步细化   |
| 自适应教学        | 规则阈值与知识图谱   | 适合作为轻量原型，尚未实证校准  |

### **1. CGI：使用方向基本正确**

低年级的 `math-teaching-core.md` 明确要求根据儿童已有的策略、问题类型、数学表达和支架进行教学。

这与 CGI 的核心研究方向相符：教师通过理解儿童如何思考，决定下一步教学，而非单纯纠正答案。

高年级的设计则更成熟：CGI 用来理解学生的策略，而不强制所有问题都采用生活情境题。

**需要修正的是理论归属表述。** 低年级文件将问题类型、策略、提问和支架都表述为由 CGI 判断，这可能使 CGI 的适用范围被扩大。建议明确 CGI 是主要教学视角之一，认知负荷、显式指导、练习与反馈还需要独立依据。

### **2. 支架教学：存在一个关键的认知科学问题**

你的设计强调：

- 学生尚未尝试时，不主动给提示。
- 每轮只提供一个支持动作。
- 学生能继续时，逐渐撤除支架。
- 确实遇到困难后，才展示必要步骤或例子。

这些规则有助于保留儿童的思考空间，但**“先让学生尝试”不应成为所有学习任务的默认前提**。

认知负荷理论和新手教学研究提醒我们：当学生缺乏必要的知识结构时，直接提供清晰的示范和完整例题，可能比持续探索更有效。

例如，第一次学习分数除法的学生，不一定需要先独立探索“为什么除以分数等于乘以倒数”。先用具体数量关系和 worked example（完整示范例题）建立理解，也可能是更好的选择。

建议将支架规则调整为：

| 学生状态       | 优先教学方式      |
| ---------- | ----------- |
| 缺少必要基础知识   | 简短讲解、示范例题   |
| 有部分基础但无法启动 | 部分示范、类比问题   |
| 已经有自己的可行策略 | 追问、比较、适度提示  |
| 基本理解但不熟练   | 独立练习、及时反馈   |
| 已熟练掌握      | 变式、迁移、解释与证明 |

这里对应的是 *expertise reversal effect*（专业知识反转效应）：学习者知识水平不同，同一种教学支持的效果也可能不同。

### **3. 一次只做一个教学动作：合理但不应绝对化**

你的低年级和高年级 Skill 都重视 `One Action per Turn`。

对儿童对话系统而言，这有明显好处：减少连续提问、降低语言负担、避免 AI 一次提供太多信息。

但**一次一个动作不等于一次只能表达一个数学关系**。

例如，学生正在理解：

\[ 3(x+2)=3x+6 \]

教师可能需要在同一轮中展示一个面积图、一个等式，并简要说明两者的对应关系。这仍然是一个完整的教学动作。

建议把该规则解释为“每轮一个主要认知目标”，允许必要的示范、表示与解释共同出现。

## **三、重点问题：学习诊断与自适应规则**

我重点审查了 `adaptive-thresholds.md`、`strategy-diagnosis-rules.md`、`practice-evidence-contract.md` 和手写识别规则。

### **1. 自适应阈值有合理性，但数字缺乏实证依据**

你设置的规则包括：

| 规则         | 当前值   | 我的判断               |
| ---------- | ----- | ------------------ |
| 独立成功后升级    | 2次    | 可作为启发式默认值，不应视为掌握标准 |
| 遇到困难后重新评估  | 2次    | 合理的触发条件，但要区分困难性质   |
| 提示等级       | H0–H4 | 分级合理，但不一定按顺序使用     |
| 清晰示范前的提示次数 | 2次    | 可能造成不必要的反复尝试       |
| 方法调整失败次数   | 2次    | 可保留为软阈值            |
| 单次错误不降级    | 是     | 很重要，建议保留           |

文件本身明确声明这些数字是默认值，而非经过实证校准的阈值。这一点是科学的。

但有一个值得修改的地方：**两个独立正确并附有解释的题目，可能仍不足以证明学生已经能够迁移。**

例如，学生连续正确计算两个同分母分数加法题，只能提供有限的同类题表现证据，不能据此认定已经理解分数加法的一般原理。

建议将证据分为四个独立维度：

**正确性**

答案及关键步骤是否成立

**概念理解**

能否说明数学关系或使用恰当表示

**独立性**

在何种提示与帮助下完成

**迁移性**

能否用于结构变化的新问题

这四个维度不一定需要增加复杂算法，也不必每轮全部测量。可以保留简单规则，但在学习记录中区分证据类型。

尤其要避免把“不会口头解释”直接解释为“不理解”。有些儿童可以通过图示、操作或正确选择策略展示理解，语言表达能力不应成为数学能力判断的唯一依据。

### **2. 程序性熟练需要更明确的位置**

你的体系对概念理解、数学关系、推理过程的关注比较充分，但对以下内容的安排相对不够突出：

- 基本数学事实的自动化，例如乘法口诀。
- 计算程序的流畅性与准确性。
- 间隔复习与累积练习。
- 不同题型之间的提取练习。

概念理解和程序性熟练并非对立，两者可以相互促进。

建议在 `targeted-practice-rules.md` 中增加一种明确的练习目的：**流畅性巩固**。

它不必增加大量重复题，而应根据学生表现，安排短时、适量、分散的练习，并逐步混合已经学过的内容。

同时，练习后的反馈不必每次要求学生完整解释。如果目标是已经理解的乘法事实提取，那么准确性和流畅性本身就是重要证据。

## **四、高年级数学方法论审核**

这是压缩包中比较有价值的部分。你已经为不同数学任务提供了专门的方法规则，而不是依赖一份笼统的数学教学提示词。

| 文件或模块                                          | 科学性判断 | 主要建议                   |
| ---------------------------------------------- | ----- | ---------------------- |
| `early-algebra.md`                             | 较好    | 保留等式关系与一般化，注意变量含义的渐进发展 |
| `proof-teaching.md`                            | 较好    | 区分观察规律、提出猜想、构造证明       |
| `derivation-teaching.md`                       | 较好    | 避免把所有公式学习变成学生独立推导      |
| `geometry-reasoning.md`                        | 较好    | 强化图形直觉与严格论证的区分         |
| `invariants-coloring.md`                       | 合理    | 作为奥数专项策略，避免机械套用        |
| `extremal-optimization.md`                     | 合理    | 强调最优值的可达到性             |
| `pigeonhole-existence.md`                      | 合理    | 强调保证存在与实际构造的区别         |
| `counterexamples-and-proposition-direction.md` | 较好    | 适合培养逻辑辨析能力             |
| `word-problem-derivation.md`                   | 较好    | 需兼顾整体数量关系与局部步骤         |
| `prerequisite-learning.md`                     | 合理    | 避免无限回溯先修知识导致偏离原任务      |

这里尤其值得保留的是证明教学的方向：**举例支持猜想，但不能代替一般性证明。**

不过，对小学高年级儿童，应允许不同层次的论证表达，包括操作解释、图示论证、一般性文字推理以及形式化证明。不能简单地用中学或大学的形式证明标准评价小学儿童。

### **一个值得补充的理论：数学能力的多维发展**

建议参考美国 National Research Council 的 *Adding It Up*（2001）提出的五个数学能力维度：

五个相互关联的数学能力维度，示意图

你的系统在概念理解、策略能力、适应性推理三个方面比较突出，但程序熟练和积极数学倾向需要更明确的教学设计。

尤其是积极数学倾向，它不仅意味着“孩子喜欢数学”，还包括相信数学是有意义、可以理解、值得努力学习的，以及相信自己能够通过学习进步。

这与儿童学习动机、数学焦虑和学习坚持性都有关系。

## **五、两个需要特别警惕的设计**

### **1. 让 AI 故意答错**

`student-problem-contract.md` 允许在学生已经确认掌握的技能上，有限度地让 AI 故意答错，再让学生评价。

这种活动与“错误示例学习”和“通过教学促进学习”有一定联系，但不能直接认为它已经得到这些研究的充分支持。

尤其对于儿童，存在三个风险：学生可能把错误答案当成正确知识；可能降低对教学系统的信任；也可能因为没有识别错误而产生不必要的挫败感。

**建议将故意错误设计成明确的“找错挑战”活动，而不是让 AI 在普通答题中隐蔽地答错。**

例如：“下面是一位虚拟同学的解法，请你判断哪里需要修改。”

这样既能保留错误分析的教育价值，也能避免 AI 的角色混淆。对于低年级学生，尤其建议采用这种显式形式。

### **2. 手写数学过程识别**

`handwritten-work-contract.md` 在科学谨慎性方面做得比较好。

它明确区分：

- 图像中的原始书写。
- 模型对书写内容的识别。
- 数学步骤的客观检查。
- 对学生错误原因的诊断。

特别是“最早能够确认的步骤错误”与“错误背后的认知原因”分离，这个原则应保留。

但这里还有一个需要强化的问题：**LLM 对手写数学表达的识别错误与数学推理错误可能叠加。**

例如把学生的 `-` 识别为 `=`，随后再基于错误转写推断学生不理解等式。

建议增加一道明确的执行门槛：关键符号存在歧义时，必须先请求学生确认，再进行认知诊断。对于复杂算式、方程和多步骤计算，尽可能引入确定性的数学校验，而非完全依靠 LLM 自行判断。

## **六、学习动机与儿童自主性**

你的数学 Skill 已经包含尊重儿童选择、不过度依赖速度评价、疲劳时调整活动，以及允许学生选择完整讲解等规则。

这些与自我决定理论（Self-Determination Theory）所强调的自主性、胜任感和关系需要相容。

但自主性支持不能仅仅等于“让学生选择”。

例如，学生不愿意解释自己的答案，可能是因为已经理解、不擅长口头表达、疲劳，或者担心答错。系统不应该仅根据拒绝解释就降低学习评价，也不能机械地终止教学。

更有效的做法是提供有意义的替代方式：让学生选择画图、比较两个解法、检查一个例子，或者直接进入下一道题。

另外，建议数学 Skill 与通用学习支持模块之间建立清晰边界：数学模块负责数学证据与教学方法，通用模块负责学习意愿、情绪支持和会话节奏，避免把每一次数学困难都解释成动机问题。

## **七、建议修改的优先级**

**第一优先级：影响教学有效性**

优先处理

1. 调整 `Guide before revealing`：增加新手学习、知识缺失时优先示范的条件。
2. 修改“独立正确且解释两次”的升级规则：保留软阈值，但区分正确、理解、独立和迁移。
3. 补充程序性熟练、间隔复习和混合练习规则。
4. 将普通学习中的隐蔽故意错误改为明确的找错活动。

**第二优先级：提升认知适配**

1. 把“一轮一个动作”定义为一个主要认知目标，而不是限制必要解释。
2. 区分新手、发展中和熟练学习者的教学支持方式。
3. 允许图示、操作、口头说明等不同方式提供理解证据。
4. 在先修知识回溯中加入任务保持和及时返回机制的验证。

**第三优先级：实证验证**

1. 设计覆盖不同年级、知识基础和错误类型的标准化教学情境。
2. 对比启发式引导、示范教学和混合策略的学习效果。
3. 开展延迟测试和迁移测试，不能只看当前对话是否完成。

## **八、如何验证 Skill 真正符合教育规律**

目前压缩包已经有较丰富的教学情境测试，但这些测试主要适合检查规则执行、数学正确性和流程一致性。

建议再建立一套**教育有效性评估**，分为三个层次：

| 评估层次 | 主要问题              | 建议指标               |
| ---- | ----------------- | ------------------ |
| 规则执行 | AI 是否按照 Skill 教学？ | 方法选择、提示时机、数学正确率    |
| 教学过程 | AI 是否真正帮助学生思考？    | 学生主动推理比例、无效追问、提示依赖 |
| 学习结果 | 学生是否学会并能够独立使用？    | 前后测、延迟保持、变式迁移      |

尤其建议加入三类对照场景：

**场景 A：完全新手。** 学生缺少必要先修知识，比较连续提问与适时示范的效果。

**场景 B：部分掌握。** 学生已经有自己的策略，但某个关键关系不清楚，观察 Skill 能否提供精准支架。

**场景 C：已经熟练。** 学生能够正确解题，观察 Skill 是否及时减少支架，并通过变式与迁移促进更深理解，而不是反复要求解释。

只有这些场景都表现合理，才能较有信心地说明系统具有适应不同认知状态的教学能力。

## **九、建议参考的核心研究**

以下文献适合成为你下一轮修改 Skill 的理论依据：

| 文献                                                                                                                | 主要贡献        | 对应模块    |
| ----------------------------------------------------------------------------------------------------------------- | ----------- | ------- |
| Carpenter et al., *Children's Mathematics: Cognitively Guided Instruction*                                        | 儿童数学策略与数量关系 | 低年级 CGI |
| National Research Council (2001), *Adding It Up*                                                                  | 数学能力五维框架    | 整体能力目标  |
| Sweller (1988), Cognitive Load During Problem Solving                                                             | 认知负荷理论      | 支架与示范   |
| Kirschner, Sweller & Clark (2006), Why Minimal Guidance During Instruction Does Not Work                          | 对低指导教学的批判   | 探究教学边界  |
| Renkl & Atkinson (2003), Structuring the Transition from Example Study to Problem Solving                         | 示例学习与逐步撤除   | 显式指导    |
| Rittle-Johnson, Siegler & Alibali (2001), Developing Conceptual Understanding and Procedural Skill in Mathematics | 概念与程序技能相互促进 | 数学练习    |
| Rohrer & Taylor (2007), The Shuffling of Mathematics Problems Improves Learning                                   | 数学交错练习      | 巩固与迁移   |
| Black & Wiliam (1998), Assessment and Classroom Learning                                                          | 形成性评价       | 学习诊断    |
| Deci & Ryan (2000), The “What” and “Why” of Goal Pursuits                                                         | 自我决定理论      | 动机与自主性  |

这些文献提供的是理论依据和研究方向，不意味着它们直接验证了你的具体阈值、Skill 结构或 LLM 教学效果。

## **十、最终审核意见**

你的数学 Skill 体系有三个值得保留的核心设计：

**第一，以学生的实际数学思考为教学依据。** 不把标准答案、固定算法或语言流畅程度等同于理解水平。

**第二，以数学任务决定教学方法。** 算术、代数、几何、证明、建模和奥数问题可以采用不同的教学策略。

**第三，以学习证据决定后续支持。** 区分独立完成、提示后完成和模仿完成，避免单次错误导致能力标签变化。

我认为目前最重要的改进方向是：

**从“如何引导学生思考”进一步发展为“在什么认知条件下，应该引导、示范、练习、复习或放手”。**

这会让你的 Skill 从一套较完整的数学教学方法集合，进一步成为一套能够根据学生认知状态选择教学行为的系统。

同时，需要强调本次审核的边界：我检查了压缩包的结构、主要教学规则和关键教学契约，但尚未对每一个奥数专项案例、所有测试情境和实际运行轨迹完成逐条数学验证。因此，以上属于**教育理论与教学机制层面的审查**，不能替代完整的数学正确性审计和真实学生实验。

下一步最有价值的工作，是逐文件建立一份**“原规则—理论依据—适用条件—潜在风险—建议修改文本”对照表**，先处理核心教学、支架、自适应、练习和诊断规则，再检查各专项 Skill 是否与核心规则一致。这样可以在保留现有架构的前提下，提高科学性，而不需要推倒重建。



# 小学数学 Skill 教学规则审计对照表

原规则列为中文摘要，附文件和定位词。修改列为可写回英文 Skill 的文本草案。范围覆盖两学段、共享数学契约和直接约束数学教学的 `learn` 规则。未修改原包，未执行运行时回归，也未逐题审核所有奥数案例。

**先改四处**：共享门槛对新授示范的限制、升阶对解释形式的约束、普通出题活动中的未标明错解、间隔复习在数学分支中的落地。保留 CGI 的儿童策略视角，以及已有的证据归因和退出机制。

路径简写：

- **G** = `learn/skills/learn-core/references/`
- **D** = `learn/skills/learn-data/references/`
- **C** = `math-common/skills/math-common/references/`
- **L** = `math-primary-low/skills/math-low-core/references/`
- **H** = `math-primary-high/skills/math-high-core/references/`

**P0** 优先改的行为，**P1** 边界澄清，**保留** 建议只补细则或测试。R 编号对应文末来源。研究支持的是教学原则，题量、提示等级、晋级次数与调度机制仍是工程选择。

## 一、教学入口与支架

| 原规则 | 理论依据 | 适用条件 | 潜在风险 | 建议修改文本 |
|---|---|---|---|---|
| **01 · P0** G `pedagogy-core.md` → Guide before revealing。学生自有题先引导，示范通常需有具体卡点及对定向支持的反应。完整解答另走知情选择。 | R1–R4。系统教学和示范有适用条件，有设计的先解后教也有价值。 | 原题求解、独立测查、约定自主推导继续走原门槛。明确新授且目标方法未学，可另题示范。 | 把未学过误当成必须先失败，或把原题改名为例题来泄题。 | **增补共享入口。** For an agreed new-learning goal, if learner report or observed evidence shows the target method or relation is new, offer one short, verified, labeled teaching example on a separate item. Preserve the learner-owned task and its key inference. No failed attempt is required. If readiness is unknown and would change the next action, use one brief probe. Keep assessment, agreed discovery, and same-task full-solution choice on their existing paths. |
| **02 · P0** L/H `scaffold-calibration.md`、L/H `math-teaching-core.md`。低段通常开始做、卡住或求助后才加载支架，高段显式指导受共享门槛约束。 | R1、R3、R5。按当前知识和反应给支持，再逐步撤除。 | 与 01 同步。正在做原题时优先接续儿童可行的策略。 | 只改共享门槛或只改本地方法表，另一处仍会拦截。把 H1–H4 当阶梯。 | **同步两段入口与方法表。** Use the shared rule to choose guided work, a labeled new-learning example, or an informed full solution. Hint levels are options, not mandatory steps. After a demonstration, offer one reachable completion step or a fresh unhinted item as appropriate. Record work on the demonstrated item as supported. |
| **03 · P1** L/H `math-teaching-core.md` → One Action per Turn。每轮一动作和一个待答问题。 | R1、R5 支持清晰而适配的表征。每轮目标数是工程规则。 | 儿童对话。呈题或独立测查轮仍止于题问。 | 将同一关系的图、式、解释硬拆开，学生要跨轮自己拼接。 | Advance one main mathematical goal with at most one pending question. A labeled teaching move may pair a diagram, an equation, and a short explanation when they show the same relation. A problem-only turn still ends at the question without an embedded hint. |
| **04 · P1** L `math-teaching-core.md` → Method、L `problem-design.md`。按 CGI 判断策略、提问和支架，默认生活故事。 | R6 支持从儿童数学思考出发。R1、R7 也支持按目标选指导、表征及练习。 | 生活故事适合数量关系和未知位置。纯计算、等式、测量可按目标选格式。 | 把 CGI 当作所有方法的排他性规定，或让无关的阅读负荷掩盖数学表现。 | Use CGI to design quantity-relationship tasks, interpret student strategies, and decide what to ask about the student's work. Select the format by goal. Prefer a story when quantity meaning matters. Use a bare calculation, number line, open sentence, or diagram when it better serves the task. |
| **05 · 保留** H `math-teaching-core.md` → CPA。用实物、图、式连接同一关系，实物和画板非必经。 | R1 支持合宜的表征及数轴，不推出固定三阶段。 | 新概念、符号意义，或学生已有图但不会对应算式。 | 表征并排不等于建立对应，已会符号操作仍被要求走全程。 | Start with a representation that makes the relevant relation accessible. State what each critical unit, segment, or symbol represents. Skip or fade a representation when it no longer helps. Board use alone is not evidence. |
| **06 · P1** H `derivation-teaching.md` → Formula-goal gate。区分发现、理解给定证明、应用。目标未定时暂不透露公式。 | R2、R4、R7。示范与自主推理服务不同目标。 | “想学怎么用”和“想自己推出来”需要分流。 | 把理解新方法自动变成独立发明，或在推导课提前透露关键关系。 | Preserve the agreed goal. For discovery, keep the target rule and its decisive inference private. For understanding a supplied rule, connect its terms and rationale. For new learning, follow the shared separate-example rule. Keep reference lookup and explicit requests for a complete target derivation on their distinct existing paths. |
| **07 · 保留** H `prerequisite-learning.md` → Identify / Check readiness。证实必要工具缺口后进入子任务，独立使用工具后只返回一层。 | R1、R5 支持针对性指导。任务栈不是心理阶段模型。 | 工具确实不会，且当前可行路线需要它。 | 把不会选法当成不会执行，或把子题成功当成原题会独立选法。 | Distinguish executing a tool from recognizing when to use it. Teach only the nearest confirmed dependency and preserve the parent. Independent use on a fresh child item permits one-layer return, not credit for parent strategy selection. Reconsider the route before descending again. |

## 二、诊断与学习证据

| 原规则 | 理论依据 | 适用条件 | 潜在风险 | 建议修改文本 |
|---|---|---|---|---|
| **08 · P0** H `adaptive-thresholds.md` → `promotion_independent_successes`。两道不同题独立完成且有解释才提供高一档，原文已声明是未校准默认值。 | R7–R9。证据应匹配所要判断的能力，数字 2 属工程。 | 同一学习目标下判断能否试一道邻近挑战。 | 两道同构题被误报为迁移，或只有口述才算理解。 | Two distinct independent successes are a default trigger to consider one nearby challenge, not a mastery or transfer threshold. Match evidence to the goal. For procedural fluency, accept accurate unprompted execution. For reasoning, accept a valid explanation, drawing, action, or written relation. If the next challenge depends on an untested distinction, probe it directly. |
| **09 · P1** G `confirm-before-accept.md`、L/H `math-segment-fields.md`。已有按需确认与独立、受助、复述区分。 | R8、R9。按学习主张选择证据。 | 只记录影响下一步的表现，不要求每轮测齐。 | 整题被标为独立，掩盖方法由老师提供。或额外增加多维评分表。 | In strategy_summary, record only what is needed for the next decision: correctness, the relation or strategy shown, support received, and any changed-context or delayed condition. Distinguish independently executing a supplied method from selecting it independently. Leave unobserved aspects unknown. Add no required field or composite score. |
| **10 · P1** G `feynman-skill-whitelist.md` → Confirmation Threshold；D `profile-schema.md` → `confirmed_skills` / `mastered_topics`。白名单阈值与档案连续两会话无记录错误另有规则。 | R2、R8、R9。延迟保持需要实际的延后作答证据。 | 区分会话内挑战、白名单和跨会话表现。 | 未记录错误被当作通过延迟复测。 | Treat confirmed_skills and mastered_topics as existing workflow labels, not evidence of retention or transfer by themselves. No recorded error is not a new success. Report delayed retention only after an observed later attempt. A local difficulty change does not replace shared confirmation rules. |
| **11 · P1** L/H `strategy-diagnosis-rules.md`。按实际动作解释。H 对疑似误解要求两个对比探查。 | R6、R8、R9。有效探查能区分竞争解释，题量不是效度。 | 笔误、读题、概念混淆等解释会改变教学时。 | 固定做两题，或用提示后的正确反推原先没有误解。 | Use the smallest contrast that distinguishes a plausible misconception from an alternative. Reuse existing discriminating work. Ask for another independent observation only if it can change the conclusion or next move. Label post-hint evidence as supported and leave unresolved causes unknown. |
| **12 · 保留** C `handwritten-work-contract.md`。歧义留未知，只检查确定性数学事实，不直接诊断。 | R9。区分可观察材料与推断。实际识别准确率需另测。 | 关键符号、单位、标注或竖式对齐有歧义。 | 低置信转写变成学生错误，再进入档案。 | If ambiguity changes the mathematical judgment, ask the learner to confirm only the relevant token or provide another view. Make no error or diagnosis claim from that token until resolved. Continue checking unrelated unambiguous steps when useful. Use deterministic arithmetic checks where available. |

## 三、练习、迁移与学生出题

| 原规则 | 理论依据 | 适用条件 | 潜在风险 | 建议修改文本 |
|---|---|---|---|---|
| **13 · P0** C `practice-evidence-contract.md`、L/H `targeted-practice-rules.md`。四类是诊断、对比、变式、联系，题数是上限。G `pedagogy-core.md` 已要求以后做间隔检查。 | R2 支持间隔和提取。R7、R10 区分且联系概念与程序。R11 是七年级交错练习证据。 | 理解已出现、提取或执行未稳。多种方法各自基本可用后，才以交错题练习辨法。 | 把复习做成题海或第五级难度。没有跨会话能力却声称已安排。 | **新增非 Tier 的 Consolidate / Revisit 用途，保留原四 Tier。** When the relation is understood but retrieval or execution is not stable, offer brief low-pressure practice, one item at a time, with specific feedback. Use the existing next-step flow to suggest a fresh later check without repeating the method first. Record delayed performance only when it occurs. Mix taught types when choosing the method is the goal. If cross-session state is unavailable, offer a copyable suggestion without claiming review is scheduled. |
| **14 · P1** L/H `problem-design.md` 与 C `practice-evidence-contract.md`。变式主要改一项，原文称只在测情境迁移时换场景。 | R8、R9、R12。控制非目标差异便于解释证据。 | 检验迁移时维持目标关系和相近的非目标负荷。换场景还可用于教学解释。 | 只换人名被计为迁移。绝对限制与兴趣桥接发生冲突。 | For a diagnostic comparison, vary the target feature and keep other demands comparable. A change of context used to clarify or reduce language load is instruction. Record independent context transfer only on a fresh, meaningfully different context with the target relation preserved and without a revealing cue. Renaming alone does not qualify. |
| **15 · 保留** H `boundary-variation.md`。改一个关键条件，判断原方法仍可用、须调整或不能用。学生可拒绝，受助另记。 | R9、R12。改变决定性条件可测辨法，具体例题仍须数学核验。 | 已对原方法有可观察的理解。 | 结果碰巧相同被当作方法仍成立，或边界辨别被混成情境迁移。 | Record the changed condition, whether the original method remains valid, and the learner's reason. A coinciding answer does not establish validity. Report boundary discrimination separately from context transfer and computation. |
| **16 · P0** C `student-problem-contract.md` → Answering / Restricted deliberate error / Role Boundary。普通活动可在确认技能上提交未标明错解，下一轮再澄清。 | R13 研究的是小数大小中的错例教学，不能直接支持隐蔽故错。标明错例是工程选择。 | 学生出题时，AI 是实际答题者。找错可另作为学生同意的对比活动。 | 对话中止时，最后可见的“正解”其实是错解。已确认技能无法防止这一点。 | In ordinary student-authored problems, verify and answer sincerely with one checkable relation. Never submit a deliberately wrong result as the AI's own answer. Offer error analysis only as a separate, explicitly labeled contrast activity. Present the sample as a claim to check, not a correct result. Clarify the correct relation when closing. Attribute error detection or repair separately from independent solving. |
| **17 · P1** C `student-problem-contract.md` 的 Feynman 分支、G `feynman-skill-whitelist.md`。数学出题的 Feynman 分支已要求同轮纠正，与普通分支的跨轮故错不同。 | R13 不支持把错例当正解。角色和纠正时点是工程规则。 | 数学出题分支，保留学生作为讲述者。 | 误删同轮纠正，或把纠正暴露后的解释计为独立发现。 | Frame an AI-supplied misconception as a clearly labeled hypothetical confusion. Keep the learner as presenter and clarify the correct relation in the same reply when this math branch supplies a wrong claim. Work after exposure may show explanation or reconstruction, not independent error detection. |

## 四、专项教学规则

| 原规则 | 理论依据 | 适用条件 | 潜在风险 | 建议修改文本 |
|---|---|---|---|---|
| **18 · 保留** H `proof-teaching.md` → Map / Validate / Organize。区分独立构造、理解、修补和组织证明。有限案例不能代替一般证明。 | R14。学校数学证明可以有适龄表征，但必须覆盖命题范围。 | 高段证明。若目标是理解已给证明，检核关键推断即可。 | 见到图就说不严谨，或教师提供关键构造后仍记为独立证明。 | Accept a diagram, manipulatives, or informal language when the argument explains why the claim holds throughout its scope. Check the key inference and assumptions. Record teacher-provided constructions and learner-owned inferences separately. A finite list of examples is not a general argument. |
| **19 · 保留** H `early-algebra.md` 与 L `relational-thinking.md`。用等式、算术结构和学生原有做法发展一般化。 | R6、R7、R12。关系理解和有目的的比较。相关比较研究不能直接外推到所有小学任务。 | 等号、变量角色、从特例到规则。图、表、语言、符号均可。 | 解出 `8 + 4 = □ + 5` 就被判已会一般化，或认识字母就被判懂变量。 | Credit an open-sentence solution only for the relation shown. Credit generalization when the learner shows what varies, what stays true, and why the claim extends beyond the listed cases. Symbolic notation is one option, not the sole criterion. |
| **20 · 保留** `math-primary-high/skills/math-high-application-modeling/SKILL.md` → The Six Parts / Execute。区分真实数据和假设，并验证结果。 | R7、R9。建模策略和证据对应，六部分不是认知阶段。 | 真实决策，尤其结论受假设、单位、数据质量影响时。 | 只算出数字就被记为完成建模，或老师给的假设被记为学生所作。 | Use the modeling parts as checkpoints, not a requirement to re-ask for work already shown. When an assumption is decisive, check one plausible alternative or state why the data do not support a firm conclusion. Record who supplied the assumption, validation, and interpretation. |

## 文件联动与实施顺序

1. **示范入口（01–02、06）**。先在 G 定义一次共享原则，数学高低段只引用并说明任务选法。同步 H 方法表、两个 `scaffold-calibration.md`、core 加载条件及例题设计。新授示范不改掉 `informed-full-solution-choice.md` 对原题完整解的路径。共享改动不要自动改变其他学科默认行为。
2. **升阶与巩固（08–10、13）**。同步高段阈值表与 Hard Constraints，保留原字段。巩固通过现有 `next_step_candidate` 和会话交接安排，检查两段 practice SKILL、补充规则和 session 入口是否能走到该活动。四个 Tier 保持兼容，不新增持久化字段、测量算法或定时服务。
3. **普通模式故错（16–17）**。修改共享契约后，核对两段 student-problem SKILL、两段 `math-student-problem-design.md`、共享白名单的学科例外及相关测试。新流程不创建待澄清的普通模式错解。若旧会话确实保有未澄清错解，恢复时先明确正解。
4. **保留职责**。诊断提供观察与证据，session 负责派发，lifecycle 负责写入。教师示范、流程选择或计划不冒充学生表现，不另造 segment。

## 最小回归用例

| 场景 | 通过标准 |
|---|---|
| 01–02 未学异分母加法，约定先学为何通分。 | 可用不同题示范同单位，无须先让学生失败。仍保留原题关键推理。对原题完整解的请求走既有知情选择。 |
| 03、08–09 学生独立画数轴正确比较小数，但不愿口述。 | 接受图示承载的证据。不因不口述降级，也不直接记为迁移。 |
| 08、10 两道同分母题正确，或两会话未记错。 | 只更新有依据的局部状态，不声称会异分母、跨情境迁移或延迟保持。 |
| 11–12 手写减号与等号看不清。 | 确认一处符号或保留未知，不写错误计数或概念误解。 |
| 13 乘法意义已懂但提取不稳，后来又开启会话。 | 低压巩固，后续可用新题无提示检查。只有实际复测才记延迟表现。 |
| 14–15 换情境后再改一个关键条件。 | 分开记迁移与条件辨别。只换人名、提前给策略或结果碰巧相同，不能替代对应证据。 |
| 16–17 孩子出题后立即离开，或选择找错活动。 | 普通答题末轮没有冒充正解的错解。找错材料一开始即标明，未识别不记为学生错误。 |
| 06–07、18 教师给关键构造，学生能算但不清楚为何要构造。 | 记受助路线与已展示的执行，策略选择留未知。检查构造用途，不倒退到算术教学或记作独立证明。 |

回归通过只说明行为符合规则。验证学习成效还应另看无提示新题、延迟保持、目标迁移，不能用对话完成率代替。

## 研究索引与证据边界

- **R1** WWC / IES（2021），[Assisting Students Struggling with Mathematics](https://ies.ed.gov/ncee/wwc/PracticeGuide/26)。小学困难干预中的系统教学与合宜表征，不直接验证聊天分支。
- **R2** Pashler 等 / WWC（2007），[Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/practiceguide/1)。间隔、例题与解题交替、主动提取。未规定本项目的题量或复习天数。
- **R3** Kalyuga 等（2003），[The Expertise Reversal Effect](https://doi.org/10.1207/S15326985EP3801_4)。指导效果随领域经验变化，不推出所有新手都要先看完整例题。
- **R4** Sinha 与 Kapur（2021），[When Problem Solving Followed by Instruction Works](https://doi.org/10.3102/00346543211019105)。有设计的先解后教不同于反复追问或放任探索。
- **R5** van de Pol 等（2010），[Scaffolding in Teacher–Student Interaction](https://doi.org/10.1007/s10648-010-9127-6)。支持随反应调整、逐步撤除和移交责任，未给固定轮数。
- **R6** Carpenter 等（1989），[Using Knowledge of Children’s Mathematics Thinking in Classroom Teaching](https://doi.org/10.3102/00028312026004499)。支持教师使用儿童的数学思考开展教学，不直接验证 AI 流程。
- **R7** National Research Council（2001），[Adding It Up](https://www.nationalacademies.org/read/9822/chapter/2)。数学熟练度的相互关联维度，用来区分目标，不用来给儿童贴标签。
- **R8** Black 与 Wiliam（1998），[Assessment and Classroom Learning](https://doi.org/10.1080/0969595980050102)。依据评价证据调整教学，不能为本项目晋级次数背书。
- **R9** Mislevy、Almond 与 Lukas（2003），[A Brief Introduction to Evidence-Centered Design](https://www.ets.org/research/policy_research_reports/publications/report/2003/hsgs.html)。用于检验主张、任务和观察证据是否匹配。
- **R10** Rittle-Johnson、Siegler 与 Alibali（2001），[Developing Conceptual Understanding and Procedural Skill in Mathematics](https://siegler.tc.columbia.edu/wp-content/uploads/2020/10/2001-Siegler-Alibali.pdf)。概念与程序的迭代关系，不要求每次练习都附带解释。
- **R11** Rohrer 等（2020），[A Randomized Controlled Trial of Interleaved Mathematics Practice](https://doi.org/10.1037/EDU0000367)。七年级课堂研究，不直接外推为小学新授做法。
- **R12** Rittle-Johnson 与 Star（2007），[Does Comparing Solution Methods Facilitate Conceptual and Procedural Knowledge?](https://doi.org/10.1037/0022-0663.99.3.561)。解方程的比较研究，不等于所有任务都应比较方法或只改一个维度。
- **R13** Durkin 与 Rittle-Johnson（2012），[The Effectiveness of Using Incorrect Examples to Support Learning about Decimal Magnitude](https://eric.ed.gov/?id=EJ955374)。具体小数任务中的错例，不是 AI 普通问答中隐蔽答错。
- **R14** Stylianides（2007），[Proof and Proving in School Mathematics](https://eric.ed.gov/?id=EJ765496)。适龄的可接受表征可以承担证明，仍须核验论证范围及关键推断。

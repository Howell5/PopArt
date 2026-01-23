# 图片生成

## 简介

图片生成接口支持文生图、图生图、图片编辑等多种功能。通过统一的API接口，您可以调用 Gemini、豆包 Seedream、GPT Image、通义千问等多个主流图像生成模型。

## 认证

<ParamField header="Authorization" type="string" required>
  Bearer Token，如 `Bearer sk-xxxxxxxxxx`
</ParamField>

## 请求参数

<ParamField body="model" type="string" required>
  模型标识，支持的模型包括：

- Gemini 系列：`gemini-2.5-flash-image` (Nano Banana)、`gemini-3-pro-image-preview` (Nano Banana Pro) 等
- 豆包 Seedream 系列：`doubao-seedream-3-0-t2i-250415`、`doubao-seedream-4-0-250828`、`doubao-seedream-4-5-251128`、`doubao-seededit-3-0-i2i-250628` 等
- GPT Image 系列：`gpt-image-1` 等
- 通义千问系列：`qwen-image-plus`、`qwen-image-edit-plus` 等
  </ParamField>

<ParamField body="prompt" type="string">
  文生图的提示词
</ParamField>

<ParamField body="response_format" type="string" default="url">
  响应格式：`b64_json` 或 `url`

**注意**：不同模型对 `response_format` 的支持情况不同：

- **Gemini 系列**：仅支持 `b64_json` 格式，无论传入什么值都会返回 base64 编码的图片数据
- **豆包 Seedream 系列**：通常返回 URL 链接，`response_format` 参数可能不生效
- **GPT Image 系列**：仅支持 `b64_json` 格式，强制返回 base64 编码的图片数据
- **通义千问系列**：支持 `b64_json` 和 `url`，会根据参数值返回对应格式（`b64_json` 会从 URL 下载并转换为 base64）
  </ParamField>

<ParamField body="contents" type="array">
  图生图或上下文对话的多轮内容
</ParamField>

## 基础示例

<Tabs>
  <Tab title="Gemini">
    <Tabs>
      <Tab title="文生图">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "gemini-2.5-flash-image",
        "prompt": "一只可爱的橙色小猫坐在花园里，阳光明媚，高质量摄影",
        "size": "16:9",
        "quality": "high",
        "n": 1,
        "temperature":1.1,
        "top_p":0.95,
        "response_format": "b64_json",
        "image_size": "2K",
        "mime_type": "image/png",
        "response_modalities": "image"
        }'
        ```
      </Tab>

      <Tab title="图生图">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "gemini-2.5-flash-image",
        "size": "16:9",
        "quality": "high",
        "image_size": "3K",
        "temperature":1.1,
        "top_p":0.95,
        "response_format": "b64_json",
        "contents": [
        {
        "role": "user",
        "parts": [
        {"text": "根据这张图帮我生成一张俯瞰广州塔的图片"},
        {"image": "data:image/png;base64,iVBORw0KGgoAAxxxx..."}
        ]
        }
        ]
        }'
        ```
      </Tab>

      <Tab title="多图融合">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "gemini-2.5-flash-image",
        "size": "16:9",
        "image_size": "3K",
        "temperature":1.1,
        "top_p":0.95,
        "response_format": "b64_json",
        "contents": [
        {
        "role": "user",
        "parts": [
        {"text": "将第一张图的油画风格应用到第二张图的内容上"},
        {"image": "https://example.com/style.jpg"},
        {"image": "https://example.com/content.jpg"}
        ]
        }
        ]
        }'
        ```
      </Tab>
    </Tabs>

  </Tab>

  <Tab title="豆包 Seedream">
    <Tabs>
      <Tab title="文生图">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "doubao-seedream-4-0-250828",
        "prompt": "一只可爱的橙色小猫坐在花园里，阳光明媚，高质量摄影",
        "size": "2048x2048",
        "watermark": false,
        "seed": 12345,
        "optimize_prompt_options": {
        "mode": "standard"
        }
        }'
        ```
      </Tab>

      <Tab title="图生图">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "doubao-seedream-4-0-250828",
        "prompt": "将这张图片改成油画风格",
        "size": "2048x2048",
        "watermark": false,
        "seed": 12345,
        "contents": [
        {
        "role": "user",
        "parts": [
        {"image": "data:image/png;base64,iVBORw0KGgoAAxxxx..."},
        {"text": "将这张图片改成油画风格"}
        ]
        }
        ]
        }'
        ```
      </Tab>

      <Tab title="组图模式">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "doubao-seedream-4-0-250828",
        "prompt": "一只可爱的橙色小猫坐在花园里，阳光明媚，高质量摄影",
        "size": "2048x2048",
        "watermark": false,
        "sequential_image_generation": "auto",
        "sequential_image_generation_options": {
        "max_images": 4
        },
        "optimize_prompt_options": {
        "mode": "standard"
        }
        }'
        ```
      </Tab>

      <Tab title="图片编辑">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "doubao-seededit-3-0-i2i-250628",
        "prompt": "将这张图片改成油画风格",
        "watermark": false,
        "guidance_scale": 2.5,
        "seed": 12345,
        "contents": [
        {
        "role": "user",
        "parts": [
        {"image": "data:image/png;base64,iVBORw0KGgoAAxxxx..."},
        {"text": "将这张图片改成油画风格"}
        ]
        }
        ]
        }'
        ```
      </Tab>

      <Tab title="3.0 模型（引导系数）">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "doubao-seedream-3-0-t2i-250415",
        "prompt": "一只可爱的橙色小猫坐在花园里，阳光明媚，高质量摄影",
        "size": "1024x1024",
        "watermark": false,
        "guidance_scale": 7.5,
        "seed": 12345
        }'
        ```
      </Tab>

      <Tab title="4.5 模型（标准/快速模式）">
        ```bash  theme={null}
        # 标准模式
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "doubao-seedream-4-5-251128",
        "prompt": "一只可爱的小猫",
        "size": "2048x2048",
        "watermark": false,
        "optimize_prompt_options": {
        "mode": "standard"
        }
        }'

        # 快速模式
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "doubao-seedream-4-0-250828",
        "prompt": "一只可爱的小猫",
        "size": "2048x2048",
        "watermark": false,
        "optimize_prompt_options": {
        "mode": "fast"
        }
        }'
        ```
      </Tab>
    </Tabs>

  </Tab>

  <Tab title="GPT Image">
    <Tabs>
      <Tab title="文生图">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "gpt-image-1",
        "prompt": "一只可爱的橙色小猫坐在花园里，阳光明媚，高质量摄影",
        "size": "1024x1024",
        "quality": "high",
        "n": 1,
        "seed":1,
        "response_format": "b64_json"
        }'
        ```
      </Tab>

      <Tab title="图生图">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "gpt-image-1",
        "prompt": "将这张图片改成油画风格",
        "size": "1024x1024",
        "quality": "high",
        "input_fidelity": "medium",
        "n": 1,
        "seed":1,
        "image": "data:image/png;base64,iVBORw0KGgoAAxxxx...",
        "response_format": "b64_json"
        }'
        ```
      </Tab>

      <Tab title="多图融合">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "gpt-image-1",
        "prompt": "将第一张图的风格应用到第二张图的内容上",
        "size": "1024x1024",
        "quality": "high",
        "input_fidelity": "high",
        "n": 2,
        "seed":1,
        "images": [
        "data:image/png;base64,iVBORw0KGgoAAxxxx...",
        "data:image/png;base64,iVBORw0KGgoAAyyyy..."
        ],
        "response_format": "b64_json"
        }'
        ```
      </Tab>
    </Tabs>

  </Tab>

  <Tab title="通义千问">
    <Tabs>
      <Tab title="文生图">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "qwen-image-plus",
        "input": {
        "messages": [
        {
        "role": "user",
        "content": [
        {
        "text": "一副典雅庄重的对联悬挂于厅堂之中，房间是个安静古典的中式布置，桌子上放着一些青花瓷，对联上左书“义本生知人机同道善思新”，右书“通云赋智乾坤启数高志远”， 横批“智启通义”，字体飘逸，在中间挂着一幅中国风的画作，内容是岳阳楼。"
        }
        ]
        }
        ]
        },
        "parameters": {
        "negative_prompt": "1",
        "prompt_extend": true,
        "seed": "4",
        "watermark": true
        }
        }'
        ```
      </Tab>

      <Tab title="图片编辑">
        ```bash  theme={null}
        curl -X POST "https://llm.ai-nebula.com/v1/images/generations" \
        -H "Authorization: Bearer sk-xxxxxxxxxx" \
        -H "Content-Type: application/json" \
        -d '{
        "model": "qwen-image-edit-plus",
        "input": {
        "messages": [
        {
        "role": "user",
        "content": [
        {
        "image": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250925/fpakfo/image36.webp"
        },
        {
        "text": "生成一张符合深度图的图像，遵循以下描述：一辆红色的破旧的自行车停在一条泥泞的小路上，背景是茂密的原始森林"
        }
        ]
        }
        ]
        },
        "parameters": {
        "n": 2,
        "negative_prompt": "低质量",
        "watermark": true,
        "size": "2048*2048",
        "seed": 1
        }
        }'
        ```
      </Tab>
    </Tabs>

  </Tab>
</Tabs>

## 模型专用参数

不同模型支持不同的参数，以下是各模型的详细参数说明：

<Tabs>
  <Tab title="豆包 Seedream">
    <ParamField body="image " type="string">
      doubao-seedream-3-0-t2i-250415 不支持该参数输入的图片信息。
      支持 URL 或 Base64 编码。其中，doubao-seedream-4.5、doubao-seedream-4.0 支持单图或多图输入（查看多图融合示例），doubao-seededit-3.0-i2i 仅支持单图输入。
    </ParamField>

    <ParamField body="size" type="string">
      图片尺寸，支持的尺寸取决于模型版本：

      * **doubao-seedream-3.0**: `1024x1024`、`1152x864`、`864x1152`、`1280x720`、`720x1280`、`1248x832`、`832x1248`、`1512x648`
      * **doubao-seedream-4.0/4.5**: `2048x2048`、`2304x1728`、`1728x2304`、`2560x1440`、`1440x2560`、`2496x1664`、`1664x2496`、`3024x1296`（2K）或 `4096x4096`、`4704x3520`、`3520x4704`、`5504x3040`、`3040x5504`、`4992x3328`、`3328x4992`、`6240x2656`（4K）
    </ParamField>

    <ParamField body="watermark" type="boolean" default="false">
      是否添加水印
    </ParamField>

    <ParamField body="seed" type="integer">
      随机种子，用于控制生成结果的随机性。相同 seed 会产生相似的结果。取值范围：`0` 到 `2147483647`
    </ParamField>

    <ParamField body="guidance_scale" type="number">
      引导系数，控制生成图像与提示词的匹配程度。值越高越严格，越低越自由。建议范围：`1.0-10.0`，默认：`2.5`。仅 `doubao-seedream-3.0-t2i-250415` 和 `doubao-seededit-3.0-i2i-250628` 支持
    </ParamField>

    <ParamField body="sequential_image_generation" type="string">
      组图功能开关，仅 `doubao-seedream-4.0` 和 `doubao-seedream-4.5` 支持：

      * `"auto"`: 启用组图功能
      * `"disabled"`: 禁用组图功能（默认）
    </ParamField>

    <ParamField body="sequential_image_generation_options" type="object">
      组图配置选项，仅在 `sequential_image_generation` 为 `"auto"` 时生效：

      * `max_images` (integer): 组图最大数量，范围 `1-4`，默认 `4`
    </ParamField>

    <ParamField body="optimize_prompt_options" type="object">
      仅 doubao-seedream-4.5（当前仅支持 standard 模式）、doubao-seedream-4.0 支持该参

      * `mode` (string): 优化模式
        * `"standard"`: 标准模式，质量更高但耗时较长（默认，4.0 和 4.5 都支持）
        * `"fast"`: 快速模式，耗时更短但质量一般（仅 4.0 支持）
    </ParamField>

  </Tab>

  <Tab title="GPT Image">
    <ParamField body="size" type="string">
      图片尺寸，支持：`1024x1024`、`1024x1536`、`1536x1024`。默认：`1024x1024`
    </ParamField>

    <ParamField body="quality" type="string" default="high">
      图片质量：

      * `"low"`: 生成速度最快，成本最低
      * `"medium"`: 平衡质量和速度（gpt-image-1-mini 默认）
      * `"high"`: 最高质量，细节最丰富（gpt-image-1 默认）
    </ParamField>

    <ParamField body="n" type="integer" default="1">
      生成图片数量，范围：`1-10`。每次生成都会消耗相应的额度
    </ParamField>

    <ParamField body="input_fidelity" type="string">
      输入保真度，仅在图生图模式下有效：

      * `"low"`: 更多创意发挥，与原图差异较大
      * `"medium"`: 平衡保真度和创意
      * `"high"`: 保持原图特征，变化较小
      * `"auto"`: 自动选择合适的保真度
    </ParamField>

    <ParamField body="image" type="string">
      单张输入图片，支持 URL 或 Base64 格式（`data:image/...;base64,...`）
    </ParamField>

    <ParamField body="images" type="array">
      多张输入图片数组，最多支持 10 张。每张图片支持 URL 或 Base64 格式
    </ParamField>

  </Tab>

  <Tab title="Gemini">
    <ParamField body="size" type="string">
      图片宽高比，支持：`1:1`、`3:2`、`2:3`、`3:4`、`4:3`、`4:5`、`5:4`、`9:16`、`16:9`、`21:9`。也可以使用像素尺寸（如 `1024x1024`），系统会自动转换为对应比例
    </ParamField>

    <ParamField body="quality" type="string">
      图片质量，映射到 `imageSize` 参数：

      * `"hd"`、`"high"`、`"2K"`: 映射到 `2K` 分辨率
      * `"standard"`、`"medium"`、`"low"`、`"auto"`、`"1K"`: 映射到 `1K` 分辨率（默认）
    </ParamField>

    <ParamField body="n" type="integer" default="1">
      生成图片数量（对应 `sample_count` 参数）
    </ParamField>

    <ParamField body="aspect_ratio" type="string">
      宽高比，与 `size` 参数功能相同
    </ParamField>

    <ParamField body="person_generation" type="string" default="allow_adult">
      人物生成控制，默认：`"allow_adult"`
    </ParamField>

    <ParamField body="max_output_tokens" type="integer" default="32768">
      输出 tokens 限制，默认：`32768`
    </ParamField>

    <ParamField body="top_p" type="number" default="0.95">
      Top-P 采样值，范围：`0.0-1.0`，默认：`0.95`
    </ParamField>

    <ParamField body="image_size" type="string">
      图片尺寸，支持：`1K`（默认）、`2K`、`4K`
    </ParamField>

    <ParamField body="mime_type" type="string" default="image/png">
      输出格式，支持：`image/png`（默认）、`image/jpeg`
    </ParamField>

    <ParamField body="response_modalities" type="string" default="image">
      响应模态，支持：`image`（默认）、`image-text`
    </ParamField>

  </Tab>

  <Tab title="通义千问">
    <ParamField body="parameters" type="object" required>
      生成参数对象，包含以下字段：

      * `role` (string, 必填): 消息发送者角色，必须设置为user。
      * `image` (string): qwen-image-edit-plus模型才有，输入图像的 URL 或 Base64 编码数据。支持传入1-3张图像。 多图输入时，按照数组顺序定义图像顺序，输出图像的比例以最后一张为准。
      * `n` (integer, 必填): 输出图像的数量，默认值为1。对于qwen-image-edit-plus系列模型，可选择输出1-6张图片。对于qwen-image-edit，仅支持输出1张图片。
      * `negative_prompt` (string): 负面提示词，用于排除不想要的元素
      * `prompt_extend` (boolean, default: true): 是否启用提示词扩展。简短提示词建议启用，详细提示词建议关闭，仅qwen-image-edit-plus系列模型支持。
      * `watermark` (boolean, default: true): 是否添加水印
      * `seed` (integer): 随机种子，范围 `0-2147483647`
    </ParamField>

  </Tab>
</Tabs>

## 响应格式

```json theme={null}
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "data": [
      {
        "url": "",
        "b64_json": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQA...",
        "revised_prompt": ""
      }
    ],
    "created": 1757320007
  }
}
```

## 支持的模型

### Gemini 系列

**模型名称**: `gemini-2.5-flash-image` (Nano Banana)

**核心能力**:

- ✅ 文生图（纯文本描述生成图片）
- ✅ 图生图（单图片+文本生成新图片）
- ✅ 多图生一图（2-5张图片融合生成）
- ✅ 多轮对话式图片生成（上下文连续修改）

**支持的宽高比**: 1:1、3:2、2:3、3:4、4:3、4:5、5:4、9:16、16:9、21:9

**图片输入**: 支持 URL 和 Base64 格式，最大 7MB

**模型名称**: `gemini-3-pro-image-preview` (Nano Banana Pro)

**核心能力**:

- ✅ 文生图（纯文本描述生成图片）
- ✅ 图生图（单图片+文本生成新图片）
- ✅ 多图生一图（2-5张图片融合生成）
- ✅ 多轮对话式图片生成（上下文连续修改）
- ✅ 更高质量的输出

**支持的宽高比**: 1:1、3:2、2:3、3:4、4:3、4:5、5:4、9:16、16:9、21:9

**图片输入**: 支持 URL 和 Base64 格式，最大 7MB

### 豆包 Seedream 系列

**模型名称**: `doubao-seedream-3-0-t2i-250415`

**核心能力**:

- ✅ 文生图（纯文本描述生成图片）
- ✅ 支持引导系数调节
- ✅ 支持随机种子控制
- ❌ 不支持图生图

**支持的尺寸**: 1024×1024、1152×864、864×1152、1280×720、720×1280、1248×832、832×1248、1512×648

**模型名称**: `doubao-seedream-4-0-250828`

**核心能力**:

- ✅ 文生图（纯文本描述生成图片）
- ✅ 图生图（单图片+文本生成新图片）
- ✅ 多图融合（2-5张图片融合生成）
- ✅ 组图功能（Sequential Image Generation）
- ✅ 支持 2K/4K 分辨率
- ✅ 支持多种图片格式

**支持的尺寸**:

- 2K: 2048×2048、2304×1728、1728×2304、2560×1440、1440×2560、2496×1664、1664×2496、3024×1296
- 4K: 4096×4096、4704×3520、3520×4704、5504×3040、3040×5504、4992×3328、3328×4992、6240×2656

**图片输入**: 支持 JPEG、PNG、WEBP、BMP、TIFF、GIF 格式，最大 10MB

**限制说明**: 最高输入加输出 15 张图，但不建议输出太多（如文生图 15 张或传入 1 张图片输出 14 张），因为输出图片越多时间越久。

**模型名称**: `doubao-seedream-4-5-251128`

**核心能力**:

- ✅ 文生图（纯文本描述生成图片）
- ✅ 图生图（单图片+文本生成新图片）
- ✅ 多图融合（2-5张图片融合生成）
- ✅ 组图功能（Sequential Image Generation）
- ✅ 支持 2K/4K 分辨率
- ✅ 支持提示词优化选项
- ✅ 支持多种图片格式

**支持的尺寸**: 与 doubao-seedream-4-0 相同

**图片输入**: 支持 JPEG、PNG、WEBP、BMP、TIFF、GIF 格式，最大 10MB

**限制说明**: 最高输入加输出 15 张图，但不建议输出太多（如文生图 15 张或传入 1 张图片输出 14 张），因为输出图片越多时间越久。

**模型名称**: `doubao-seededit-3-0-i2i-250628`

**核心能力**:

- ✅ 图片编辑（单图片+文本编辑）
- ✅ 支持引导系数调节
- ✅ 支持随机种子控制
- ✅ 图片编辑（修改内容、风格迁移等）
- ❌ 不支持纯文生图

**支持的尺寸**: 自适应（根据输入图片尺寸自动调整）

**图片输入**: 支持 JPEG、PNG 格式，最大 10MB，单张图片

### GPT 图像生成系列

**模型名称**: `gpt-image-1`

**核心能力**:

- ✅ 文生图（纯文本描述生成图片）
- ✅ 图生图（最多10张图片+文本）
- ✅ 支持图片质量选择
- ✅ 支持输入保真度调节
- ✅ 多图融合生成

**支持的尺寸**: 1024×1024、1024×1536、1536×1024

**图片质量**: `low`、`medium`、`high`

**生成数量**: 单次请求可生成 1-10 张图片

**图片输入**: 支持 JPEG、PNG、GIF、WEBP 格式，最大 10MB，最多10张图片

**模型名称**: `gpt-image-1-mini`

**核心能力**:

- ✅ 文生图（纯文本描述生成图片）
- ✅ 图生图（最多10张图片+文本）
- ✅ 支持图片质量选择
- ✅ 更快的生成速度
- ✅ 更低的成本

**支持的尺寸**: 与 gpt-image-1 相同

**图片质量**: `low`、`medium`、`high`

**生成数量**: 单次请求可生成 1-10 张图片

### 通义千问系列

**模型名称**: `qwen-image-plus`

**核心能力**:

- ✅ 文生图（纯文本描述生成图片）
- ✅ 中英文文本渲染（擅长在图片中生成复杂文字）
- ✅ 多种艺术风格
- ✅ 提示词智能扩展
- ❌ 不支持图生图

**支持的尺寸**: 1328×1328、1664×928、928×1664、1472×1140、1140×1472

**计费方式**: 按张计费（¥0.18/张）

**模型名称**: `qwen-image-edit-plus`

**核心能力**:

- ✅ 图片编辑（输入一张图，输出最多可生成 6 张图片）
- ✅ 修改图内文字
- ✅ 增删/移动物体
- ✅ 迁移图片风格
- ✅ 增强画面细节

**图片输入**: 支持 JPEG、JPG、PNG、BMP、TIFF、WEBP 格式，最大 10MB

**输出说明**: 实际输出数量受图片内容和编辑复杂度影响，最多可生成 6 张图片

## 最佳实践

### 提示词优化建议

<Tabs>
  <Tab title="Gemini (Nano Banana)">
    1. **明确比例需求**：在提示词中说明构图方向
       * 横屏：使用"横向构图"、"宽屏视角"
       * 竖屏：使用"竖向构图"、"垂直视角"

    2. **高质量关键词**：
       * "高质量"、"高清"、"专业摄影"
       * "8k分辨率"、"细节丰富"

    3. **多图融合技巧**：
       * 明确说明每张图片的作用
       * 指定融合方式（风格迁移、元素组合等）

  </Tab>

  <Tab title="豆包 Seedream">
    1. **明确风格需求**：
       * 写实风格：添加"照片级真实"、"超写实"
       * 艺术风格：添加"油画风格"、"水彩画"、"素描"
       * 动漫风格：添加"动漫风格"、"二次元"、"卡通"

    2. **高质量关键词**：
       * "4K分辨率"、"8K画质"、"超高细节"
       * "专业摄影"、"电影级光影"

    3. **组图生成技巧**（doubao-seedream-4.x）：
       * 保持提示词风格一致性
       * 使用`sequential_image_generation`参数启用组图模式
       * 控制`max_images`参数设置组图数量（1-4张）

    4. **提示词优化**（doubao-seedream-4.5）：
       * 使用`optimize_prompt_options`参数优化提示词
       * 可选模式：`standard`（标准）、`creative`（创意）、`precise`（精确）

  </Tab>

  <Tab title="GPT Image">
    1. **明确图片质量**：
       * 使用`quality`参数控制质量：`low`、`medium`、`high`
       * 高质量图片添加描述词："专业摄影"、"高细节"、"8K"

    2. **多图输入技巧**：
       * 最多支持10张图片输入
       * 使用`input_fidelity`参数控制输入图片保真度：`low`、`medium`、`high`、`auto`
       * 明确说明每张参考图的作用

    3. **提示词优化**：
       * 详细描述想要的画面内容
       * 指定艺术风格、光照条件、构图方式
       * 添加负面描述排除不想要的内容

    4. **图片数量控制**：
       * 使用`n`参数控制生成数量（1-10张）
       * 对于复杂场景建议生成多张选择最佳结果

  </Tab>

  <Tab title="通义千问">
    1. **文本渲染技巧**：
       * 在提示词中用引号明确标注文字内容
       * 示例："一张海报，标题是"夏日特惠""

    2. **提示词扩展**：
       * 简短提示词：启用 `prompt_extend: true`
       * 详细提示词：关闭 `prompt_extend: false`

    3. **负面提示词**：
       * 排除不想要的元素："模糊、低质量、水印"
       * 文本渲染："模糊的文字、错别字"

  </Tab>
</Tabs>

### 尺寸选择建议

<Tabs>
  <Tab title="社交媒体">
    * **微信朋友圈**: 1328×1328 (1:1) 或 1140×1472 (3:4)
    * **微博头图**: 1664×928 (16:9)
    * **抖音封面**: 928×1664 (9:16)
    * **小红书**: 1140×1472 (3:4)
  </Tab>

  <Tab title="设计用途">
    * **网站横幅**: 1664×928 (16:9) 或 21:9
    * **海报**: 1140×1472 (3:4) 或 928×1664 (9:16)
    * **产品图片**: 1328×1328 (1:1)
    * **手机壁纸**: 928×1664 (9:16)
  </Tab>
</Tabs>

## 常见问题

<Tabs>
  <Tab title="通用问题">
    <AccordionGroup>
      <Accordion title="支持的图片格式有哪些？">
        不同模型支持的格式不同：

        * Gemini：PNG、JPEG、JPG、WEBP，最大 7MB
        * 豆包 Seedream 3.0/4.0：JPEG、PNG，最大 10MB
        * 豆包 Seedream 4.5：JPEG、PNG、WEBP、BMP、TIFF、GIF，最大 10MB
        * GPT Image：JPEG、PNG、GIF、WEBP，最大 10MB
        * 通义千问：JPEG、JPG、PNG、BMP、TIFF、WEBP，最大 10MB
      </Accordion>

      <Accordion title="生成的图片有效期是多久？">
        图片URL的有效期约为24小时。建议在收到响应后立即下载保存，或上传到您自己的存储服务。
      </Accordion>

      <Accordion title="可以同时生成多张图片吗？">
        通义千问系列每次请求生成1张图片。如需多张，请发起多个并发请求。
      </Accordion>
    </AccordionGroup>

  </Tab>

  <Tab title="Gemini (Nano Banana)">
    <AccordionGroup>
      <Accordion title="如何在对话中保持相同的宽高比？">
        在 `contents` 对话数组中，每次请求都要带上 `size` 参数，系统会为当前请求应用指定的宽高比。
      </Accordion>

      <Accordion title="使用 URL 图片有什么要求？">
        URL 必须是可公开访问的 HTTP/HTTPS 地址，支持格式包括 PNG、JPEG、JPG、WEBP，最大 7MB。
      </Accordion>

      <Accordion title="多图融合最多支持几张图片？">
        支持 2-5 张图片同时输入，建议 2-3 张效果最佳。
      </Accordion>
    </AccordionGroup>

  </Tab>

  <Tab title="豆包 Seedream">
    <AccordionGroup>
      <Accordion title="doubao-seedream-3.0 支持图生图吗？">
        不支持。doubao-seedream-3.0-t2i-250415 是纯文生图模型，只支持通过文本描述生成图片。
      </Accordion>

      <Accordion title="doubao-seedream-4.x 支持哪些图片格式？">
        doubao-seedream-4.0 和 4.5 支持 JPEG、PNG、WEBP、BMP、TIFF、GIF 格式，最大 10MB。
      </Accordion>

      <Accordion title="组图功能如何使用？">
        使用 `sequential_image_generation` 参数启用组图模式，设置为 `auto` 即可。可以通过 `max_images` 控制组图数量（1-4张）。
      </Accordion>

      <Accordion title="提示词优化选项有什么作用？">
        doubao-seedream-4.5 支持 `optimize_prompt_options` 参数，可选 `standard`（标准）、`creative`（创意）、`precise`（精确）三种模式，用于优化提示词效果。
      </Accordion>

      <Accordion title="doubao-seededit 支持哪些编辑功能？">
        doubao-seededit-3.0-i2i-250628 支持图片编辑，包括修改内容、风格迁移、增强细节等，需要输入一张图片和编辑指令。
      </Accordion>
    </AccordionGroup>

  </Tab>

  <Tab title="GPT Image">
    <AccordionGroup>
      <Accordion title="GPT Image 支持哪些图片格式？">
        支持 JPEG、PNG、GIF、WEBP 格式，最大 10MB。
      </Accordion>

      <Accordion title="最多可以输入多少张图片？">
        gpt-image-1 和 gpt-image-1-mini 最多支持 10 张图片输入。
      </Accordion>

      <Accordion title="图片质量参数如何选择？">
        `quality` 参数可选 `low`、`medium`、`high`：

        * `low`：生成速度最快，成本最低
        * `medium`：平衡质量和速度
        * `high`：最高质量，细节最丰富
      </Accordion>

      <Accordion title="输入保真度有什么作用？">
        `input_fidelity` 参数控制输入图片的保真度，可选 `low`、`medium`、`high`、`auto`：

        * `low`：更多创意发挥，与原图差异较大
        * `high`：保持原图特征，变化较小
        * `auto`：自动选择合适的保真度
      </Accordion>

      <Accordion title="可以同时生成多张图片吗？">
        可以，使用 `n` 参数控制生成数量（1-10张），每张图片都会消耗相应的额度。
      </Accordion>
    </AccordionGroup>

  </Tab>

  <Tab title="通义千问">
    <AccordionGroup>
      <Accordion title="qwen-image-plus 支持图生图吗？">
        不支持。qwen-image-plus 是纯文生图模型，只支持通过文本描述生成图片。
      </Accordion>

      <Accordion title="如何生成带有中文文字的图片？">
        在提示词中明确说明文字内容，例如："一张海报，标题是"双十一大促"，副标题"全场5折起""
      </Accordion>

      <Accordion title="提示词扩展和负面提示词可以同时使用吗？">
        可以！两者互不冲突。建议：简短提示词 + 启用扩展 + 添加负面提示词，效果最佳。
      </Accordion>
    </AccordionGroup>

  </Tab>
</Tabs>

## 相关资源

<Columns cols={2}>
  <Card title="视频生成" icon="video" href="/cn/api-reference/endpoint/video-generation">
    查看视频生成接口文档
  </Card>

  <Card title="模型列表" icon="list" href="/cn/api-reference/models">
    查看所有支持的模型信息
  </Card>
</Columns>

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.openai-nebula.com/llms.txt

# 美式商务证件照提示词与复核

## 基础编辑提示词

将下面内容作为身份保持型图像编辑的基础提示词；按输入照片补充必要信息，但不要把偶然光线、临时表情或背景当成身份特征。

```text
Use case: identity-preserve
Asset type: professional business headshot for public media and corporate profiles
Input image: the user's own or authorized portrait is the strict identity reference

Primary request: Transform the subject into a polished American-style business headshot while preserving the exact identity of the person in the input photo.

Identity invariants: Keep the same face shape, facial proportions, eye shape and spacing, eyebrows, nose, lips, ears, jawline, hairline, age, ethnicity, and natural asymmetry. The result must be immediately recognizable as the same person. Do not beautify into a generic model and do not change bone structure.

Subject styling: Neat business hairstyle compatible with the original hairline, density, color, and texture. Calm, confident expression with a restrained natural smile and direct eye contact.

Wardrobe: A high-quality, well-tailored dark navy wool suit with realistic fine texture, a crisp white dress shirt, and a low-saturation deep purple silk tie. Natural shoulder construction, clean lapels, symmetrical shirt collar, and a correctly tied knot. No visible brand.

Backdrop: Seamless pure white studio background with no gradient, scenery, props, furniture, wall shadows, or decorative elements.

Lighting and camera: Soft, even professional studio lighting; natural catchlights; realistic skin tone and texture; subtle facial modeling without hard shadows. Eye-level camera, centered head-and-shoulders composition, natural 85mm portrait perspective, sharp eyes and hair detail.

Output: Vertical 3:4 composition suitable for a 1080×1440 export. Leave safe space above the hair and keep the full hair, ears, jaw, shirt collar, tie knot, and upper shoulders visible.

Constraints: No text, name, job title, logo, watermark, border, ID-card template, badge, interface chrome, jewelry, pocket square, tie clip, glasses, or facial hair unless already present and explicitly requested. No plastic skin, face drift, asymmetrical pupils, warped ears, cheap shiny fabric, gray background, or non-uniform scaling.
```

## 身份漂移时的单点回改

不要重写整个场景。使用一条针对性指令，只恢复身份，保持已正确的服装、背景、构图和灯光不变：

```text
Restore the subject's identity to match the input portrait exactly. Correct only the face shape, eyes, eyebrows, nose, mouth, ears, jawline, hairline, and age cues. Keep the current navy suit, white shirt, deep purple tie, pure white background, lighting, pose, crop, and resolution unchanged. Do not add text or accessories.
```

## 常见失败与处理

- **像“同类型的人”但不像本人**：回到主身份参考，锁定五官比例和发际线；不要靠磨皮或加深轮廓掩盖身份漂移。
- **头发更时尚但不像本人**：恢复原发量、原卷曲程度和原发际线，只整理轮廓与碎发。
- **西装显廉价**：要求细密羊毛纹理、自然垂坠、清楚肩线和驳领；移除高反光聚酯感，不添加奢侈品牌标识。
- **脸太白或皮肤像塑料**：降低磨皮，恢复自然肤色、毛孔、细纹和局部色差；保留柔光而不是曝光过度。
- **白底发灰或有环境感**：明确 seamless pure white studio background；检查四角、头发边缘和肩部边缘。
- **为了3:4切掉关键部位**：优先扩展白底和服装区域，或重新构图；不要拉伸人物，也不要切掉头顶、耳朵、领带结和肩线。
- **出现姓名或职业文字**：删除全部文字并重新检查角落和服装区域；无文字是不可变合同。

## 最终复核顺序

1. 本人身份与年龄感。
2. 眼睛、耳朵、发际线和下颌的局部真实性。
3. 西装、衬衫、领带的结构与质感。
4. 纯白背景与人物边缘。
5. 3:4构图、清晰度、无文字和无水印。

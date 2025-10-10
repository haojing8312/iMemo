# 模板图片目录

此目录包含用于 AI 生图的模板底图。

## 文件列表

### white-base-4x3.png
- **用途**: nano banana 生图底图
- **尺寸**: 800x600px (4:3 比例)
- **颜色**: 纯白色 (#FFFFFF)
- **格式**: PNG
- **大小**: ~2.3 KB

## 使用方法

### 在 nano banana 中使用

1. **访问 nano banana API** 或使用支持的图像生成工具
2. **上传底图**: 选择 `white-base-4x3.png` 作为基础图片
3. **设置模式**:
   - Image-to-Image (img2img) 模式
   - 或 Inpainting 模式
4. **输入提示词**: 使用 `docs/style-image-generation-guide.md` 中的提示词
5. **调整强度**:
   - Denoising strength: 0.7-0.9 (推荐 0.8)
   - CFG Scale: 7-12 (推荐 8-10)
6. **生成图片**: 确保输出保持 4:3 比例

### 示例使用流程

```bash
# 示例：使用 API 调用
curl -X POST "https://api.nano-banana.com/generate" \
  -F "image=@public/templates/white-base-4x3.png" \
  -F "prompt=柔和粉彩风格婴儿肖像..." \
  -F "strength=0.8" \
  -F "aspect_ratio=4:3"
```

## 生成新的底图

如需重新生成或调整尺寸，运行：

```bash
node scripts/generate-white-base.js
```

可以在脚本中修改 `WIDTH` 和 `HEIGHT` 常量来调整尺寸。

## 其他比例底图

如需其他比例的底图，可以修改脚本参数：

- **1:1 (正方形)**: WIDTH=600, HEIGHT=600
- **16:9 (宽屏)**: WIDTH=800, HEIGHT=450
- **3:2 (相机)**: WIDTH=900, HEIGHT=600
- **9:16 (竖屏)**: WIDTH=450, HEIGHT=800

---

**创建日期**: 2025-10-09
**版本**: 1.0

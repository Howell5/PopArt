import { Editor, uniqueId, TLShapeId, createShapeId } from 'tldraw'

// Onboarding image URLs - all images will be displayed at the same size
const ONBOARDING_IMAGES = [
  { url: '/onboarding-1.png', width: 1024, height: 1024 },
  { url: '/onboarding-2.png', width: 2048, height: 2048 },
  { url: '/onboarding-3.png', width: 2048, height: 2048 },
]

// Display size for images (all images will be this size)
const IMAGE_DISPLAY_SIZE = 300
const IMAGE_GAP = 60
const ARROW_LENGTH = 60

// Step labels and example prompts
const STEPS = [
  { label: '选择一张图片', prompt: null },
  { label: '描述你想要的变化', prompt: '"转换为水彩插画风格"' },
  { label: '继续迭代，探索更多可能', prompt: '"添加飘落的樱花花瓣"' },
]

// Helper to fetch image and convert to data URL
const fetchImageAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Create onboarding content on the canvas
export const createOnboardingContent = async (editor: Editor): Promise<void> => {
  // All images use the same display size for consistency
  const displayWidth = IMAGE_DISPLAY_SIZE
  const displayHeight = IMAGE_DISPLAY_SIZE

  // Calculate layout - image + gap + arrow + gap pattern
  const cellWidth = displayWidth + IMAGE_GAP + ARROW_LENGTH
  const totalWidth = cellWidth * 2 + displayWidth // 3 images, 2 arrows
  const startX = -totalWidth / 2
  const imageY = 0

  // Create assets and shapes for each image
  const shapeIds: TLShapeId[] = []
  const imagePositions: { x: number; y: number; width: number; height: number }[] = []

  for (let i = 0; i < ONBOARDING_IMAGES.length; i++) {
    const img = ONBOARDING_IMAGES[i]
    const dataUrl = await fetchImageAsDataUrl(img.url)

    // Calculate position - evenly spaced
    const x = startX + i * cellWidth
    const y = imageY

    imagePositions.push({ x, y, width: displayWidth, height: displayHeight })

    // Create asset
    const assetId = `asset:${uniqueId()}` as any
    editor.createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: `onboarding-${i + 1}.png`,
          src: dataUrl,
          w: img.width,
          h: img.height,
          mimeType: 'image/png',
          isAnimated: false,
        },
        meta: {},
      },
    ])

    // Create image shape
    const shapeId = createShapeId()
    editor.createShape({
      id: shapeId,
      type: 'image',
      x,
      y,
      props: {
        assetId,
        w: displayWidth,
        h: displayHeight,
      },
      meta: {
        source: 'onboarding',
      } as any,
    })
    shapeIds.push(shapeId)
  }

  // Create step labels and prompts below images
  for (let i = 0; i < ONBOARDING_IMAGES.length; i++) {
    const pos = imagePositions[i]
    const step = STEPS[i]

    // Step label
    const labelEstimatedWidth = step.label.length * 14
    const labelId = createShapeId()
    editor.createShape({
      id: labelId,
      type: 'text',
      x: pos.x + pos.width / 2 - labelEstimatedWidth / 2,
      y: pos.y + pos.height + 20,
      props: {
        text: step.label,
        size: 's',
        font: 'sans',
        textAlign: 'middle',
        autoSize: true,
      },
    })
    shapeIds.push(labelId)

    // Example prompt (if exists)
    if (step.prompt) {
      const promptEstimatedWidth = step.prompt.length * 10 // smaller font
      const promptId = createShapeId()
      editor.createShape({
        id: promptId,
        type: 'text',
        x: pos.x + pos.width / 2 - promptEstimatedWidth / 2,
        y: pos.y + pos.height + 48,
        props: {
          text: step.prompt,
          size: 's',
          font: 'mono',
          textAlign: 'middle',
          autoSize: true,
          color: 'grey',
        },
      })
      shapeIds.push(promptId)
    }
  }

  // Create arrows between images
  for (let i = 0; i < imagePositions.length - 1; i++) {
    const from = imagePositions[i]
    const to = imagePositions[i + 1]

    // Arrow starts after image + gap, ends before next image
    const arrowStartX = from.x + from.width + IMAGE_GAP / 2
    const arrowEndX = to.x - IMAGE_GAP / 2
    const arrowY = from.y + from.height / 2

    const arrowId = createShapeId()
    editor.createShape({
      id: arrowId,
      type: 'arrow',
      x: arrowStartX,
      y: arrowY,
      props: {
        start: { x: 0, y: 0 },
        end: { x: arrowEndX - arrowStartX, y: 0 },
        color: 'grey',
        size: 'm',
        arrowheadEnd: 'arrow',
        arrowheadStart: 'none',
      },
    })
    shapeIds.push(arrowId)
  }

  // Create tip text at the bottom (centered)
  const tipText = '💡 新建 Page = 新建项目，尽情探索'
  const tipEstimatedWidth = tipText.length * 14
  const tipY = imagePositions[0].y + imagePositions[0].height + 90
  const tipId = createShapeId()
  editor.createShape({
    id: tipId,
    type: 'text',
    x: -tipEstimatedWidth / 2,
    y: tipY,
    props: {
      text: tipText,
      size: 's',
      font: 'sans',
      textAlign: 'middle',
      autoSize: true,
    },
  })
  shapeIds.push(tipId)

  // Zoom to fit all content
  editor.zoomToFit({ animation: { duration: 0 } })

  // Zoom out a bit for better overview
  const currentZoom = editor.getZoomLevel()
  if (currentZoom > 0.8) {
    editor.setCamera({
      ...editor.getCamera(),
      z: 0.8
    }, { animation: { duration: 0 } })
  }
}

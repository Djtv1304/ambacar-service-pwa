"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Stage, Layer, Image as KonvaImage, Line, Arrow, Circle, Transformer } from "react-konva"
import useImage from "use-image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Pencil,
  MousePointer2,
  ArrowUpRight,
  Circle as CircleIcon,
  Eraser,
  Undo2,
  Trash2,
  Loader2,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Tipos para las anotaciones
type ToolType = "select" | "pencil" | "arrow" | "circle" | "eraser"

interface LineData {
  id: string
  tool: "pencil" | "eraser"
  points: number[]
  color: string
  strokeWidth: number
}

interface ShapeData {
  id: string
  type: "arrow" | "circle"
  x: number
  y: number
  // Para flechas
  points?: number[]
  // Para círculos
  radius?: number
  color: string
  strokeWidth: number
  rotation?: number
  scaleX?: number
  scaleY?: number
}

type HistoryItem = 
  | { type: "line"; data: LineData }
  | { type: "shape"; data: ShapeData }

interface AnnotationData {
  lines: LineData[]
  shapes: ShapeData[]
  imageId: string
}

interface AnnotationEditorProps {
  imageUrl: string
  imageId: string
  onSave?: (data: AnnotationData) => void
  initialAnnotations?: AnnotationData
}

// Colores del tema Ambacar
const COLORS = {
  red: "#ED1C24",      // Rojo Ambacar
  yellow: "#FFD700",   // Amarillo resaltador
  white: "#FFFFFF",    // Blanco para contraste
}

const STROKE_WIDTHS = {
  thin: 3,
  thick: 8,
}

// Genera IDs únicos
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export function AnnotationEditor({
  imageUrl,
  imageId,
  onSave,
  initialAnnotations,
}: AnnotationEditorProps) {
  // Cargar imagen usando use-image
  const [image, imageStatus] = useImage(imageUrl, "anonymous")
  
  // Referencias
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const transformerRef = useRef<any>(null)
  
  // Estado del canvas
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)
  
  // Estado de la herramienta
  const [tool, setTool] = useState<ToolType>("select")
  const [color, setColor] = useState(COLORS.red)
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTHS.thin)
  
  // Estado del dibujo
  const [lines, setLines] = useState<LineData[]>(initialAnnotations?.lines || [])
  const [shapes, setShapes] = useState<ShapeData[]>(initialAnnotations?.shapes || [])
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  // Historial para undo
  const [history, setHistory] = useState<HistoryItem[]>([])
  
  // Calcular dimensiones del canvas basado en el contenedor y la imagen
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !image) return
      
      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight || 500
      
      const imageAspectRatio = image.width / image.height
      const containerAspectRatio = containerWidth / containerHeight
      
      let newWidth: number
      let newHeight: number
      
      if (imageAspectRatio > containerAspectRatio) {
        // Imagen más ancha - ajustar al ancho
        newWidth = containerWidth
        newHeight = containerWidth / imageAspectRatio
      } else {
        // Imagen más alta - ajustar a la altura
        newHeight = Math.min(containerHeight, 600)
        newWidth = newHeight * imageAspectRatio
      }
      
      setStageSize({ width: newWidth, height: newHeight })
      setScale(newWidth / image.width)
    }
    
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [image])
  
  // Actualizar transformer cuando cambia la selección
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = stageRef.current
      const selectedNode = stage?.findOne(`#${selectedId}`)
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer()?.batchDraw()
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
    }
  }, [selectedId])
  
  // Obtener posición del puntero (funciona con mouse y touch)
  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return null
    
    const pos = stage.getPointerPosition()
    if (!pos) return null
    
    // Ajustar por escala
    return {
      x: pos.x / scale,
      y: pos.y / scale,
    }
  }, [scale])
  
  // Handlers de dibujo unificados
  const handleDrawStart = useCallback(() => {
    if (tool === "select") return
    
    const pos = getPointerPosition()
    if (!pos) return
    
    setIsDrawing(true)
    setSelectedId(null)
    
    if (tool === "pencil" || tool === "eraser") {
      const newLine: LineData = {
        id: generateId(),
        tool: tool === "eraser" ? "eraser" : "pencil",
        points: [pos.x, pos.y],
        color: tool === "eraser" ? "#000000" : color,
        strokeWidth: tool === "eraser" ? strokeWidth * 2 : strokeWidth,
      }
      setLines((prev) => [...prev, newLine])
      setHistory((prev) => [...prev, { type: "line", data: newLine }])
    }
  }, [tool, color, strokeWidth, getPointerPosition])
  
  const handleDrawMove = useCallback(() => {
    if (!isDrawing) return
    if (tool !== "pencil" && tool !== "eraser") return
    
    const pos = getPointerPosition()
    if (!pos) return
    
    setLines((prev) => {
      const lastLine = prev[prev.length - 1]
      if (!lastLine) return prev
      
      const newPoints = [...lastLine.points, pos.x, pos.y]
      const updatedLine = { ...lastLine, points: newPoints }
      
      return [...prev.slice(0, -1), updatedLine]
    })
  }, [isDrawing, tool, getPointerPosition])
  
  const handleDrawEnd = useCallback(() => {
    setIsDrawing(false)
  }, [])
  
  // Insertar flecha en el centro
  const insertArrow = useCallback(() => {
    if (!image) return
    
    const centerX = image.width / 2
    const centerY = image.height / 2
    
    const newArrow: ShapeData = {
      id: generateId(),
      type: "arrow",
      x: centerX - 50,
      y: centerY,
      points: [0, 0, 100, 0],
      color,
      strokeWidth: strokeWidth + 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    }
    
    setShapes((prev) => [...prev, newArrow])
    setHistory((prev) => [...prev, { type: "shape", data: newArrow }])
    setSelectedId(newArrow.id)
    setTool("select")
  }, [image, color, strokeWidth])
  
  // Insertar círculo en el centro
  const insertCircle = useCallback(() => {
    if (!image) return
    
    const centerX = image.width / 2
    const centerY = image.height / 2
    
    const newCircle: ShapeData = {
      id: generateId(),
      type: "circle",
      x: centerX,
      y: centerY,
      radius: 50,
      color,
      strokeWidth: strokeWidth + 1,
      scaleX: 1,
      scaleY: 1,
    }
    
    setShapes((prev) => [...prev, newCircle])
    setHistory((prev) => [...prev, { type: "shape", data: newCircle }])
    setSelectedId(newCircle.id)
    setTool("select")
  }, [image, color, strokeWidth])
  
  // Deshacer última acción
  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    
    const lastItem = history[history.length - 1]
    
    if (lastItem.type === "line") {
      setLines((prev) => prev.filter((l) => l.id !== lastItem.data.id))
    } else {
      setShapes((prev) => prev.filter((s) => s.id !== lastItem.data.id))
    }
    
    setHistory((prev) => prev.slice(0, -1))
    setSelectedId(null)
  }, [history])
  
  // Eliminar elemento seleccionado o todas las anotaciones si es eraser mode
  const handleDelete = useCallback(() => {
    if (selectedId) {
      setShapes((prev) => prev.filter((s) => s.id !== selectedId))
      setLines((prev) => prev.filter((l) => l.id !== selectedId))
      setHistory((prev) => prev.filter((h) => h.data.id !== selectedId))
      setSelectedId(null)
    }
  }, [selectedId])
  
  // Limpiar todas las anotaciones
  const handleClearAll = useCallback(() => {
    setLines([])
    setShapes([])
    setHistory([])
    setSelectedId(null)
  }, [])
  
  // Manejar transformaciones de formas
  const handleShapeTransform = useCallback((id: string, newAttrs: Partial<ShapeData>) => {
    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === id ? { ...shape, ...newAttrs } : shape
      )
    )
  }, [])
  
  // Click en el stage para deseleccionar
  const handleStageClick = useCallback((e: any) => {
    // Click en área vacía deselecciona
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
    }
  }, [])
  
  // Guardar anotaciones
  const handleSave = useCallback(() => {
    const annotationData: AnnotationData = {
      lines,
      shapes,
      imageId,
    }
    
    console.log("📝 Annotation Data (simulando envío al backend):", annotationData)
    
    onSave?.(annotationData)
  }, [lines, shapes, imageId, onSave])
  
  // Cursor basado en herramienta
  const getCursor = () => {
    switch (tool) {
      case "pencil":
      case "eraser":
        return "crosshair"
      case "arrow":
      case "circle":
        return "copy"
      default:
        return "default"
    }
  }
  
  // Loading state
  if (imageStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#ED1C24]" />
          <span className="text-sm text-gray-600">Cargando imagen...</span>
        </div>
      </div>
    )
  }
  
  if (imageStatus === "failed") {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <span className="text-sm text-red-600">Error al cargar la imagen</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full bg-black"
        style={{ 
          touchAction: "none",
          cursor: getCursor(),
        }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleDrawStart}
          onMouseMove={handleDrawMove}
          onMouseUp={handleDrawEnd}
          onMouseLeave={handleDrawEnd}
          onTouchStart={handleDrawStart}
          onTouchMove={handleDrawMove}
          onTouchEnd={handleDrawEnd}
          onClick={handleStageClick}
          onTap={handleStageClick}
          style={{ margin: "0 auto", display: "block" }}
        >
          {/* Capa de imagen de fondo */}
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={image.width}
                height={image.height}
                listening={false}
              />
            )}
          </Layer>
          
          {/* Capa de dibujos */}
          <Layer>
            {/* Líneas (trazos de lápiz y borrador) */}
            {lines.map((line) => (
              <Line
                key={line.id}
                id={line.id}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            ))}
            
            {/* Flechas */}
            {shapes
              .filter((s) => s.type === "arrow")
              .map((arrow) => (
                <Arrow
                  key={arrow.id}
                  id={arrow.id}
                  x={arrow.x}
                  y={arrow.y}
                  points={arrow.points || [0, 0, 100, 0]}
                  stroke={arrow.color}
                  strokeWidth={arrow.strokeWidth}
                  fill={arrow.color}
                  pointerLength={15}
                  pointerWidth={15}
                  rotation={arrow.rotation || 0}
                  scaleX={arrow.scaleX || 1}
                  scaleY={arrow.scaleY || 1}
                  draggable={tool === "select"}
                  onClick={() => tool === "select" && setSelectedId(arrow.id)}
                  onTap={() => tool === "select" && setSelectedId(arrow.id)}
                  onDragEnd={(e) => {
                    handleShapeTransform(arrow.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    })
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target
                    handleShapeTransform(arrow.id, {
                      x: node.x(),
                      y: node.y(),
                      rotation: node.rotation(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    })
                  }}
                />
              ))}
            
            {/* Círculos */}
            {shapes
              .filter((s) => s.type === "circle")
              .map((circle) => (
                <Circle
                  key={circle.id}
                  id={circle.id}
                  x={circle.x}
                  y={circle.y}
                  radius={circle.radius || 50}
                  stroke={circle.color}
                  strokeWidth={circle.strokeWidth}
                  fill="transparent"
                  scaleX={circle.scaleX || 1}
                  scaleY={circle.scaleY || 1}
                  draggable={tool === "select"}
                  onClick={() => tool === "select" && setSelectedId(circle.id)}
                  onTap={() => tool === "select" && setSelectedId(circle.id)}
                  onDragEnd={(e) => {
                    handleShapeTransform(circle.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    })
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target
                    handleShapeTransform(circle.id, {
                      x: node.x(),
                      y: node.y(),
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    })
                  }}
                />
              ))}
            
            {/* Transformer para redimensionar/rotar */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limitar tamaño mínimo
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox
                }
                return newBox
              }}
              anchorSize={16}
              anchorCornerRadius={3}
              anchorStroke="#ED1C24"
              anchorFill="#fff"
              borderStroke="#ED1C24"
              borderStrokeWidth={2}
              padding={8}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-right",
                "middle-left",
              ]}
              rotateEnabled={true}
              keepRatio={false}
            />
          </Layer>
        </Stage>
      </div>
      
      {/* Toolbar - Below canvas, responsive */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-t border-gray-200 p-3"
      >
        {/* Mobile: Two rows layout */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Row 1: Drawing tools */}
          <div className="flex items-center justify-center gap-1">
            <Toggle
              pressed={tool === "select"}
              onPressedChange={() => setTool("select")}
              size="sm"
              className={cn(
                "data-[state=on]:bg-[#ED1C24] data-[state=on]:text-white"
              )}
            >
              <MousePointer2 className="h-4 w-4" />
            </Toggle>
            
            <Toggle
              pressed={tool === "pencil"}
              onPressedChange={() => setTool("pencil")}
              size="sm"
              className={cn(
                "data-[state=on]:bg-[#ED1C24] data-[state=on]:text-white"
              )}
            >
              <Pencil className="h-4 w-4" />
            </Toggle>
            
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={insertArrow}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={insertCircle}
            >
              <CircleIcon className="h-4 w-4" />
            </Button>
            
            <Toggle
              pressed={tool === "eraser"}
              onPressedChange={() => setTool("eraser")}
              size="sm"
              className={cn(
                "data-[state=on]:bg-[#ED1C24] data-[state=on]:text-white"
              )}
            >
              <Eraser className="h-4 w-4" />
            </Toggle>
            
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleUndo}
              disabled={history.length === 0}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClearAll}
              disabled={lines.length === 0 && shapes.length === 0}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Row 2: Colors and stroke */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5">
              {Object.entries(COLORS).map(([name, colorValue]) => (
                <button
                  key={name}
                  onClick={() => setColor(colorValue)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform active:scale-95",
                    color === colorValue
                      ? "border-gray-800 ring-2 ring-gray-300"
                      : "border-gray-300"
                  )}
                  style={{ backgroundColor: colorValue }}
                  aria-label={`Color ${name}`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Grosor</span>
              <Slider
                value={[strokeWidth]}
                onValueChange={([value]) => setStrokeWidth(value)}
                min={1}
                max={12}
                step={1}
                className="w-20"
              />
            </div>
          </div>
        </div>
        
        {/* Desktop: Single row layout */}
        <div className="hidden sm:flex items-center justify-center gap-1 flex-wrap">
          {/* Drawing tools */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={tool === "select"}
                  onPressedChange={() => setTool("select")}
                  size="sm"
                  className={cn(
                    "data-[state=on]:bg-[#ED1C24] data-[state=on]:text-white"
                  )}
                >
                  <MousePointer2 className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Seleccionar</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={tool === "pencil"}
                  onPressedChange={() => setTool("pencil")}
                  size="sm"
                  className={cn(
                    "data-[state=on]:bg-[#ED1C24] data-[state=on]:text-white"
                  )}
                >
                  <Pencil className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Lápiz</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={insertArrow}
                  className="hover:bg-gray-100"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insertar Flecha</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={insertCircle}
                  className="hover:bg-gray-100"
                >
                  <CircleIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insertar Círculo</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={tool === "eraser"}
                  onPressedChange={() => setTool("eraser")}
                  size="sm"
                  className={cn(
                    "data-[state=on]:bg-[#ED1C24] data-[state=on]:text-white"
                  )}
                >
                  <Eraser className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Borrador</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="w-px h-6 bg-gray-200 mx-2" />
          
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {Object.entries(COLORS).map(([name, colorValue]) => (
              <Tooltip key={name}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setColor(colorValue)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                      color === colorValue
                        ? "border-gray-800 ring-2 ring-gray-300"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: colorValue }}
                    aria-label={`Color ${name}`}
                  />
                </TooltipTrigger>
                <TooltipContent className="capitalize">{name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          <div className="w-px h-6 bg-gray-200 mx-2" />
          
          {/* Stroke width */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Grosor</span>
            <Slider
              value={[strokeWidth]}
              onValueChange={([value]) => setStrokeWidth(value)}
              min={1}
              max={12}
              step={1}
              className="w-20"
            />
          </div>
          
          <div className="w-px h-6 bg-gray-200 mx-2" />
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="hover:bg-gray-100"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deshacer</TooltipContent>
            </Tooltip>
            
            <AnimatePresence>
              {selectedId && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleDelete}
                        className="hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar selección</TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearAll}
                  disabled={lines.length === 0 && shapes.length === 0}
                  className="hover:bg-red-100 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Limpiar todo</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Save button - Always visible */}
        <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
          <Button
            onClick={handleSave}
            className="bg-[#ED1C24] hover:bg-[#c41820] text-white"
            disabled={lines.length === 0 && shapes.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Anotaciones
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

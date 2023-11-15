import axios from 'axios'
import { merge } from 'lodash'
import { MoveInfo } from '~/components/panes/PlayBoard/GeneralBoard.vue'
import { fillRectImageData } from '~/components/panes/PlayBoard/add-in/coordinate'
import {
  drawMapLineImageData,
  getNearPoint,
  getNearestMapLineUuid
} from '~/components/panes/PlayBoard/add-in/map-line/coordinate'
import { StoreType as RoomCollectionStore } from '~/data/RoomCollections'
import { MapLine, sendParams as lineParams } from '~/data/RoomCollections/MapLine'

const lineLocParams = ['x1', 'y1', 'x2', 'y2', 'play_board_uuid'] as const
export type LineParams = Pick<MapLine, (typeof lineParams)[number]>
export type LineLoc = Pick<MapLine, (typeof lineLocParams)[number]>
const isEqlLineLoc = (p1: LineLoc, p2: LineLoc) => !lineLocParams.some(key => p1[key] !== p2[key])

export default class {
  private holdWriteMapLines: LineParams[] = []
  private mouseNearMapLineUuid: string | null = null
  private drawingMapLineInfo: LineParams | null = null

  public onUpdateMapLines(store: RoomCollectionStore) {
    this.holdWriteMapLines
      .map((l, idx) => (store.mapLines.value.some(ml => isEqlLineLoc(ml, l)) ? idx : null))
      .filter((idx): idx is number => idx !== null)
      .reverse()
      .forEach(idx => this.holdWriteMapLines.splice(idx, 1))
  }

  public onStartMove(moveInfo: MoveInfo, play_board_uuid: string, color: string, gridSize: number) {
    switch (moveInfo.mode) {
      case 'add-in:add': {
        const p = getNearPoint(moveInfo, gridSize)

        this.drawingMapLineInfo = {
          play_board_uuid,
          x1: p.x,
          y1: p.y,
          x2: p.x,
          y2: p.y,
          color
        }
        break
      }
      case 'add-in:delete':
        // TODO
        break
      default:
    }
  }

  public onMove(moveInfo: MoveInfo, play_board_uuid: string, store: RoomCollectionStore, gridSize: number) {
    if (this.drawingMapLineInfo) {
      const p = getNearPoint(moveInfo, gridSize)

      this.drawingMapLineInfo.x2 = p.x
      this.drawingMapLineInfo.y2 = p.y
    }
    if (moveInfo.mode === 'add-in:move') {
      this.mouseNearMapLineUuid = getNearestMapLineUuid(play_board_uuid, moveInfo, gridSize, store)
    }
  }

  public onEndMove(moveInfo: MoveInfo, store: RoomCollectionStore) {
    if (moveInfo.mode === 'add-in:add') {
      const dmlInfo = this.drawingMapLineInfo
      if (dmlInfo) {
        if (dmlInfo.x1 !== dmlInfo.x2 || dmlInfo.y1 !== dmlInfo.y2) {
          this.holdWriteMapLines.push(dmlInfo)
          store
            .addMapLine(
              merge(
                {
                  axios
                },
                dmlInfo
              )
            )
            .then()
        }
        this.drawingMapLineInfo = null
      }
    }
  }

  public paint({
    imageData,
    gridSize,
    moveInfo,
    playBoardUuid,
    store,
    canvasWidth,
    color
  }: {
    imageData: ImageData
    gridSize: number
    moveInfo: MoveInfo
    playBoardUuid: string
    store: RoomCollectionStore
    canvasWidth: number
    color: number[]
  }) {
    const filterFunc = (ml: LineParams & { uuid?: string }) =>
      ml.play_board_uuid === playBoardUuid && ml.uuid !== this.mouseNearMapLineUuid

    const useDrawMapLine = drawMapLineImageData.bind(null, imageData, gridSize, false, canvasWidth)

    // 全部描く
    store.mapLines.value.filter(filterFunc).forEach(useDrawMapLine)
    this.holdWriteMapLines.filter(filterFunc).forEach(useDrawMapLine)

    // マウスカーソルの近くの線を描く
    if (this.mouseNearMapLineUuid) {
      const focusLine = store.mapLines.value.find(ml => ml.uuid === this.mouseNearMapLineUuid)
      if (focusLine) {
        drawMapLineImageData(imageData, gridSize, true, canvasWidth, focusLine)
      }
    }

    // 描いてる途中の線を描く
    if (this.drawingMapLineInfo) {
      drawMapLineImageData(imageData, gridSize, false, canvasWidth, this.drawingMapLineInfo)
    }

    // マウスカーソルの点を描く
    if (moveInfo.toolType === 'line' && moveInfo.mode === 'add-in:add') {
      const p = getNearPoint(moveInfo, gridSize)
      const px = p.x * gridSize
      const py = p.y * gridSize
      const s = 3
      fillRectImageData(imageData, canvasWidth, color, px - s, py - s, s * 2, s * 2)
    }
  }
}

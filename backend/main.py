import asyncio
import json
import math
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

steps = [
    {"id": 1, "num": "01", "name": "放置产品", "status": "pending"},
    {"id": 2, "num": "02", "name": "安装后端盖", "status": "pending"},
    {"id": 3, "num": "03", "name": "打钉", "status": "pending"},
    {"id": 4, "num": "04", "name": "移走产品", "status": "pending"},
]

error_info = {
    "workstation": "工位④",
    "detection": "打钉缺失",
    "step": "流程5-03 打钉",
    "time": "14:33:07",
}

header_info = {
    "title": "SOP 工序检测",
    "userName": "张晓明",
    "workOrder": "WO-20260821-0001",
    "workstation": "工位 GW20",
}


@app.get("/api/steps")
async def get_steps():
    return {"steps": steps, "errorInfo": error_info, "headerInfo": header_info}


def lerp(a, b, t):
    return a + (b - a) * t


def get_color(progress):
    start = [229, 72, 72]
    mid = [59, 130, 246]
    end = [59, 206, 90]

    if progress < 0.5:
        t = progress * 2
        r = round(lerp(start[0], mid[0], t))
        g = round(lerp(start[1], mid[1], t))
        b = round(lerp(start[2], mid[2], t))
    else:
        t = (progress - 0.5) * 2
        r = round(lerp(mid[0], end[0], t))
        g = round(lerp(mid[1], end[1], t))
        b = round(lerp(mid[2], end[2], t))
    return f"rgb({r}, {g}, {b})"


@app.websocket("/ws/steps")
async def websocket_steps(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_text("waiting")

            message = await websocket.receive_text()
            if message != "start":
                continue

            for i in range(4):
                steps_copy = []
                for j, step in enumerate(steps):
                    if j < i:
                        steps_copy.append({**step, "status": "completed", "color": None})
                    elif j == i:
                        steps_copy.append({**step, "status": "sim", "color": "rgb(229, 72, 72)"})
                    else:
                        steps_copy.append({**step, "status": "pending", "color": None})

                await websocket.send_text(json.dumps({
                    "type": "step_update",
                    "current_step": i,
                    "steps": steps_copy,
                }))

                duration = 5.0
                interval = 0.05
                elapsed = 0.0

                while elapsed < duration:
                    await asyncio.sleep(interval)
                    elapsed += interval
                    progress = elapsed / duration
                    color = get_color(progress)

                    steps_copy_sim = []
                    for j, step in enumerate(steps):
                        if j < i:
                            steps_copy_sim.append({**step, "status": "completed", "color": None})
                        elif j == i:
                            steps_copy_sim.append({**step, "status": "sim", "color": color})
                        else:
                            steps_copy_sim.append({**step, "status": "pending", "color": None})

                    await websocket.send_text(json.dumps({
                        "type": "step_update",
                        "current_step": i,
                        "steps": steps_copy_sim,
                    }))

                await websocket.send_text(json.dumps({
                    "type": "step_update",
                    "current_step": i,
                    "steps": [
                        {**step, "status": "completed" if j <= i else "pending", "color": None}
                        for j, step in enumerate(steps)
                    ],
                }))

    except WebSocketDisconnect:
        pass

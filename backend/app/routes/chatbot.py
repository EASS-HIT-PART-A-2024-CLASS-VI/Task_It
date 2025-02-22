# from fastapi import APIRouter, HTTPException, Depends
# from openai import OpenAI
# from bson import ObjectId
# import os
# from app.db import db
# from app.routes.users import get_current_user
# from app.crud import create_task, create_group, assign_task_to_user, update_task_status, get_task_by_id, get_user_by_email



# def generate_tasks_from_request(user_request):
#     """Uses AI to generate structured tasks dynamically."""
#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[
#             {"role": "system", "content": "Generate a list of key tasks for the given project description."},
#             {"role": "user", "content": user_request}
#         ]
#     )
#     return response.choices[0].message.content.split("\n")

# @router.post("/chatbot")
# async def chatbot_endpoint(request: dict, user: dict = Depends(get_current_user)):
#     user_message = request.get("message", "").lower()
    
#     # AI Board and Dynamic Task Creation
#     if "i want to" in user_message or "make me a program" in user_message:
#         project_name = user_message.replace("i want to", "").replace("make me a program to", "").strip()
#         new_board = await create_group({"name": project_name, "created_by": ObjectId(user["id"])})
#         generated_tasks = generate_tasks_from_request(project_name)
        
#         for task_title in generated_tasks:
#             new_task = {
#                 "title": task_title,
#                 "description": f"Task generated for {project_name}",
#                 "status": "Pending",
#                 "priority": "Medium",
#                 "board_id": new_board["_id"],
#                 "created_by": ObjectId(user["id"])
#             }
#             await create_task(new_task)
#         return {"reply": f"✅ Project '{project_name}' created with AI-generated tasks."}
    
#     # AI Task Assignment
#     if "assign" in user_message and "task" in user_message:
#         parts = user_message.split(" to ")
#         if len(parts) == 2:
#             task_title, assignee_name = parts[0].replace("assign task", "").strip(), parts[1].strip()
#             task = await db.tasks.find_one({"title": task_title})
#             assignee = await get_user_by_email(assignee_name)
            
#             if task and assignee:
#                 await assign_task_to_user(str(task["_id"]), str(assignee["_id"]))
#                 return {"reply": f"✅ Task '{task_title}' assigned to {assignee_name}."}
#             return {"reply": "❌ Task or user not found."}
    
#     # AI Task Status Update
#     if "move" in user_message and "to done" in user_message:
#         task_title = user_message.replace("move", "").replace("to done", "").strip()
#         task = await db.tasks.find_one({"title": task_title})
#         if task:
#             await update_task_status(str(task["_id"]), "Done")
#             return {"reply": f"✅ Task '{task_title}' marked as done."}
#         return {"reply": "❌ Task not found."}
    
#     # AI General Chat Response
#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[{"role": "user", "content": user_message}],
#     )
#     return {"reply": response.choices[0].message.content}

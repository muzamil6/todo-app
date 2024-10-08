import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchTasks, addTask, deleteTask } from "../../redux/taskSlice";
import { RootState, AppDispatch } from "../../redux/store";
import toast from "react-hot-toast";
import { unwrapResult } from "@reduxjs/toolkit";
import { themes } from "../themes/theme";
import { Theme } from "../../type/type.todo";

export const useTaskPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const listId = searchParams?.get("page");
  const title = searchParams?.get("title") ?? "";
  const themeValue = searchParams?.get("theme");

  const dispatch = useDispatch<AppDispatch>();
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const selectedThemeFromLocalStorage = localStorage.getItem("navbarTheme");
    const selectedTheme = themeValue
      ? themes.find((theme) => theme.value === themeValue)
      : selectedThemeFromLocalStorage
      ? JSON.parse(selectedThemeFromLocalStorage)
      : themes.find((theme) => theme.value === "vibrantSpectrum"); // Default theme

    if (selectedTheme) {
      setCurrentTheme(selectedTheme);
      localStorage.setItem("navbarTheme", JSON.stringify(selectedTheme));
    }
  }, [themeValue]);

  const tasks = useSelector((state: RootState) => state.tasks?.tasks || []);
  const taskStatus = useSelector((state: RootState) => state.tasks?.status);
  const error = useSelector((state: RootState) => state.tasks?.error);

  useEffect(() => {
    if (listId) {
      dispatch(fetchTasks(listId));
    }
  }, [dispatch, listId]);

  const handleAddTask = async () => {
    if (!newTaskTitle) {
      toast.error("Task title is required");
      return;
    }

    try {
      const result = unwrapResult(
        await dispatch(
          addTask({ title: newTaskTitle, listId: listId as string })
        )
      );
      await dispatch(fetchTasks(listId as string));
      setNewTaskTitle("");
      toast.success("Task added successfully");
    } catch (err) {
      toast.error("Error adding task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!listId) {
      toast.error("List ID is required to delete a task");
      return;
    }
    try {
      const result = unwrapResult(
        await dispatch(deleteTask({ taskId, listId }))
      );
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error("Error deleting task");
    }
  };

  const handleCheckboxChange = (taskId: string, currentStatus: boolean) => {
    const newCompletedTasks = { ...completedTasks, [taskId]: !currentStatus };
    setCompletedTasks(newCompletedTasks);
    toast.success(`Task ${!currentStatus ? "completed" : "not completed"}`);
  };

  return {
    router,
    listId,
    title,
    currentTheme,
    newTaskTitle,
    setNewTaskTitle,
    handleAddTask,
    handleDeleteTask,
    handleCheckboxChange,
    tasks,
    taskStatus,
    error,
    completedTasks,
  };
};

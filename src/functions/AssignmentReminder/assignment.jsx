import React, { useEffect, useState, useCallback } from "react";
import { db } from "../../functions/Authentication/firebase";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import HomeHeader from "../Home/HomeHeader";
import { FiPlus, FiTrash2, FiEdit, FiCalendar, FiBook, FiAlignLeft } from "react-icons/fi";
import "../AssignmentReminder/assignment.css";
import AddToCalendarButton from "./AddToCalendarButton";

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    priority: "medium"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const auth = getAuth();
  const user = auth.currentUser;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subject || !formData.dueDate) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      if (isEditing) {
        await deleteDoc(doc(db, "assignments", currentId));
      }

      await addDoc(collection(db, "assignments"), {
        uid: user.uid,
        ...formData,
        createdAt: new Date()
      });

      resetForm();
      fetchAssignments();
    } catch (error) {
      console.error("Error saving assignment:", error);
    }
  };

  const handleEdit = (assignment) => {
    setFormData({
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description,
      dueDate: assignment.dueDate,
      priority: assignment.priority || "medium"
    });
    setCurrentId(assignment.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteDoc(doc(db, "assignments", id));
        fetchAssignments();
      } catch (error) {
        console.error("Error deleting assignment:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      description: "",
      dueDate: "",
      priority: "medium"
    });
    setIsEditing(false);
    setCurrentId("");
  };

  const fetchAssignments = useCallback(async () => {
    if (!user) return;

    const q = query(collection(db, "assignments"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const fetchedAssignments = [];
    querySnapshot.forEach((doc) => {
      fetchedAssignments.push({ id: doc.id, ...doc.data() });
    });

    fetchedAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    setAssignments(fetchedAssignments);
  }, [user]);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high": return "priority-high";
      case "medium": return "priority-medium";
      case "low": return "priority-low";
      default: return "";
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === "all") return true;
    return assignment.priority === activeTab;
  });

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user, fetchAssignments]);

  return (
    <div className="assignment-page">
      <HomeHeader />

      <div className="assignment-container">
        <h1 className="page-title">📚 Assignment Reminder</h1>

        <form className="assignment-form" onSubmit={handleSubmit}>
          <h2>{isEditing ? "Edit Assignment" : "Add New Assignment"}</h2>

          <div className="form-group">
            <label><FiBook /> Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Assignment title"
              required
            />
          </div>

          <div className="form-group">
            <label><FiBook /> Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Course/subject name"
              required
            />
          </div>

          <div className="form-group">
            <label><FiAlignLeft /> Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Assignment details (optional)"
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FiCalendar /> Due Date</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <FiPlus /> {isEditing ? "Update Assignment" : "Add Assignment"}
            </button>
            {isEditing && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="assignment-list">
          <div className="list-header">
            <h2>📅 Your Assignments</h2>
            <div className="priority-tabs">
              <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All</button>
              <button className={activeTab === "high" ? "active" : ""} onClick={() => setActiveTab("high")}>High</button>
              <button className={activeTab === "medium" ? "active" : ""} onClick={() => setActiveTab("medium")}>Medium</button>
              <button className={activeTab === "low" ? "active" : ""} onClick={() => setActiveTab("low")}>Low</button>
            </div>
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="empty-state">
              <p>No assignments found. Add your first assignment!</p>
            </div>
          ) : (
            <ul>
              {filteredAssignments.map((assignment) => (
                <li key={assignment.id} className={getPriorityClass(assignment.priority)}>
                  <div className="assignment-content">
                    <div className="assignment-main">
                      <h3>{assignment.title}</h3>
                      <span className="subject">{assignment.subject}</span>
                    </div>
                    <div className="assignment-details">
                      {assignment.description && (
                        <p className="description">{assignment.description}</p>
                      )}
                      <div className="due-date">
                        <FiCalendar /> Due: {new Date(assignment.dueDate).toLocaleString()}
                      </div>
                      <AddToCalendarButton assignment={assignment} userEmail={user.email} />

                    </div>
                  </div>
                  <div className="assignment-actions">
                    <button className="btn-edit" onClick={() => handleEdit(assignment)}>
                      <FiEdit />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(assignment.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assignment;

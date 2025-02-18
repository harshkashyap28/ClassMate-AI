import React, { useState } from 'react';
import { auth, firestore } from '../Authentication/firebase'; // Correct import
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Auth function
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'; // Firestore functions

function AdminManagement() {
  const [email, setEmail] = useState('');
  
  // Function to generate a random password
  function generatePassword() {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) { // 12 characters long password
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // Create a new admin user
  function createAdminUser(email) {
    const password = generatePassword(); // Generate a temporary password

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        
        // Store admin data in Firestore
        setDoc(doc(firestore, 'admins', user.uid), {
          email: user.email,
          role: 'admin',
          createdAt: serverTimestamp()
        }).then(() => {
          console.log('Admin user created and data stored!');
          // Here, you would manually send the email with ID and password
        }).catch(error => {
          console.error('Error storing admin data in Firestore:', error);
        });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
      });
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      createAdminUser(email);
    } else {
      alert("Please enter an email address.");
    }
  };

  return (
    <div>
      <h2>Create Admin User</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter Admin Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <button type="submit">Create Admin</button>
      </form>
    </div>
  );
}

export default AdminManagement;

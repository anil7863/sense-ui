/**
 * SenseUI Projects Management - Bundled Version
 * Handles project CRUD operations and UI interactions
 */

// ============================================================================
// CONFIGURATION & STORAGE
// ============================================================================
const STORAGE_KEYS = {
    PROJECTS: 'senseui_projects',
    ACTIVE_PROJECT: 'senseui_active_project'
};

// ============================================================================
// PROJECT STORAGE FUNCTIONS
// ============================================================================

/**
 * Get all projects from storage
 * @returns {Promise<Array>} Array of project objects
 */
async function getAllProjects() {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEYS.PROJECTS);
        return result[STORAGE_KEYS.PROJECTS] || [];
    } catch (error) {
        console.error('Error getting projects:', error);
        return [];
    }
}

/**
 * Save a new project or update an existing one
 * @param {Object} project - Project object with name, frameworks, aesthetic, purpose
 * @param {string} projectId - Optional ID for updating existing project
 * @returns {Promise<Object>} The saved project with ID
 */
async function saveProject(project, projectId = null) {
    try {
        console.log('💾 Attempting to save project:', { project, projectId });
        const projects = await getAllProjects();
        console.log('📋 Current projects count:', projects.length);
        
        if (projectId) {
            // Update existing project - preserve existing fields like createdAt
            const index = projects.findIndex(p => p.id === projectId);
            if (index !== -1) {
                projects[index] = { ...projects[index], ...project };
                console.log('✏️ Updated existing project at index:', index);
            }
        } else {
            // Create new project
            const newProject = {
                ...project,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            projects.push(newProject);
            console.log('➕ Created new project with ID:', newProject.id);
        }
        
        await chrome.storage.local.set({ [STORAGE_KEYS.PROJECTS]: projects });
        console.log('✅ Project saved successfully to storage');
        return projectId ? projects.find(p => p.id === projectId) : projects[projects.length - 1];
    } catch (error) {
        console.error('❌ Error saving project:', error);
        console.error('Error details:', error.message, error.stack);
        throw error;
    }
}

/**
 * Delete a project
 * @param {string} projectId - ID of the project to delete
 * @returns {Promise<void>}
 */
async function deleteProject(projectId) {
    try {
        const projects = await getAllProjects();
        const filtered = projects.filter(p => p.id !== projectId);
        await chrome.storage.local.set({ [STORAGE_KEYS.PROJECTS]: filtered });
        
        // Clear active project if it was deleted
        const activeProject = await getActiveProject();
        if (activeProject && activeProject.id === projectId) {
            await setActiveProject(null);
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

/**
 * Get the currently active project
 * @returns {Promise<Object|null>} Active project object or null
 */
async function getActiveProject() {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_PROJECT);
        return result[STORAGE_KEYS.ACTIVE_PROJECT] || null;
    } catch (error) {
        console.error('Error getting active project:', error);
        return null;
    }
}

/**
 * Set the active project
 * @param {Object|null} project - Project object or null to clear
 * @returns {Promise<void>}
 */
async function setActiveProject(project) {
    try {
        if (project === null) {
            await chrome.storage.local.remove(STORAGE_KEYS.ACTIVE_PROJECT);
        } else {
            await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_PROJECT]: project });
        }
    } catch (error) {
        console.error('Error setting active project:', error);
        throw error;
    }
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================

let projectToDelete = null;

/**
 * Render the list of projects
 */
async function renderProjectsList() {
    const projects = await getAllProjects();
    const projectsList = document.getElementById('projects-list');
    
    if (!projectsList) {
        console.error('❌ projects-list element not found in DOM');
        return;
    }
    
    // Clear the list
    projectsList.innerHTML = '';
    
    if (projects.length === 0) {
        const noProjectsMessage = document.createElement('p');
        noProjectsMessage.id = 'no-projects-message';
        noProjectsMessage.textContent = 'No projects yet. Create your first project below.';
        projectsList.appendChild(noProjectsMessage);
        return;
    }
    
    // Sort projects alphabetically by name
    projects.sort((a, b) => a.name.localeCompare(b.name));
    
    projects.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.role = 'listitem';
        
        const projectInfo = document.createElement('div');
        projectInfo.className = 'project-info';
        
        const projectName = document.createElement('h3');
        projectName.textContent = project.name;
        
        const projectDetails = document.createElement('p');
        projectDetails.innerHTML = `<strong>Frameworks:</strong> ${project.frameworks}<br>
                                    <strong>Aesthetic:</strong> ${project.aesthetic}<br>
                                    <strong>Purpose:</strong> ${project.purpose}`;
        
        projectInfo.appendChild(projectName);
        projectInfo.appendChild(projectDetails);
        
        const projectActions = document.createElement('div');
        projectActions.className = 'project-actions';
        
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-secondary';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('aria-label', `Edit ${project.name}`);
        editBtn.onclick = () => editProject(project);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-secondary';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', `Delete ${project.name}`);
        deleteBtn.onclick = () => showDeleteDialog(project);
        
        projectActions.appendChild(editBtn);
        projectActions.appendChild(deleteBtn);
        
        projectItem.appendChild(projectInfo);
        projectItem.appendChild(projectActions);
        
        projectsList.appendChild(projectItem);
    });
}

/**
 * Edit a project - populate form with project data
 */
function editProject(project) {
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-frameworks').value = project.frameworks;
    document.getElementById('project-aesthetic').value = project.aesthetic;
    document.getElementById('project-purpose').value = project.purpose;
    document.getElementById('edit-project-id').value = project.id;
    
    // Update form heading and button text
    document.getElementById('project-form-heading').textContent = 'Edit Project';
    document.getElementById('save-project-btn').textContent = 'Save Changes';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    
    // Scroll to form
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
    
    // Announce to screen readers
    announceToScreenReader('Editing project: ' + project.name);
}

/**
 * Cancel editing and reset form
 */
function cancelEdit() {
    resetForm();
    announceToScreenReader('Edit cancelled');
}

/**
 * Reset the project form
 */
function resetForm() {
    document.getElementById('project-form').reset();
    document.getElementById('edit-project-id').value = '';
    document.getElementById('project-form-heading').textContent = 'Create New Project';
    document.getElementById('save-project-btn').textContent = 'Create Project';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

/**
 * Show delete confirmation dialog
 */
function showDeleteDialog(project) {
    projectToDelete = project;
    const dialog = document.getElementById('delete-dialog');
    const dialogText = document.getElementById('delete-dialog-text');
    dialogText.textContent = `Are you sure you want to delete "${project.name}"? This action cannot be undone.`;
    dialog.showModal();
    
    // Focus on the dialog text for screen reader announcement
    setTimeout(() => dialogText.focus(), 100);
}

/**
 * Handle project deletion
 */
async function handleDelete() {
    if (!projectToDelete) return;
    
    try {
        await deleteProject(projectToDelete.id);
        const dialog = document.getElementById('delete-dialog');
        dialog.close();
        
        announceToScreenReader(`Project "${projectToDelete.name}" deleted successfully`);
        projectToDelete = null;
        
        await renderProjectsList();
    } catch (error) {
        announceToScreenReader('Error deleting project. Please try again.');
    }
}

/**
 * Cancel deletion
 */
function cancelDelete() {
    const dialog = document.getElementById('delete-dialog');
    dialog.close();
    projectToDelete = null;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('project-name').value.trim();
    const frameworks = document.getElementById('project-frameworks').value.trim();
    const aesthetic = document.getElementById('project-aesthetic').value.trim();
    const purpose = document.getElementById('project-purpose').value.trim();
    const editId = document.getElementById('edit-project-id').value;
    
    // Validation
    if (!name || !frameworks || !aesthetic || !purpose) {
        announceToScreenReader('Please fill in all required fields');
        return;
    }
    
    const project = { name, frameworks, aesthetic, purpose };
    
    try {
        console.log('📝 Form submitted with data:', { name, frameworks, aesthetic, purpose, editId });
        const savedProject = await saveProject(project, editId || null);
        
        if (editId) {
            announceToScreenReader(`Project "${name}" updated successfully`);
            // Update active project if it was the one edited
            const activeProject = await getActiveProject();
            if (activeProject && activeProject.id === editId) {
                await setActiveProject(savedProject);
            }
        } else {
            announceToScreenReader(`Project "${name}" created successfully`);
        }
        
        resetForm();
        await renderProjectsList();
    } catch (error) {
        console.error('❌ Error in handleFormSubmit:', error);
        console.error('Error details:', error.message, error.stack);
        announceToScreenReader(`Error saving project: ${error.message}. Please try again.`);
    }
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
    const status = document.getElementById('project-status');
    status.textContent = message;
    
    // Clear after a delay
    setTimeout(() => {
        status.textContent = '';
    }, 3000);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Render initial projects list
    await renderProjectsList();
    
    // Set up event listeners
    document.getElementById('project-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);
    document.getElementById('confirm-delete').addEventListener('click', handleDelete);
    document.getElementById('cancel-delete').addEventListener('click', cancelDelete);
    
    // Close dialog on ESC key
    document.getElementById('delete-dialog').addEventListener('cancel', cancelDelete);
});

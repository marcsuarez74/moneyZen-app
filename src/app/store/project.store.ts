import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Project } from '../models/project.model';

export interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProjectId: null
};

export const ProjectStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    addProject(project: Project) {
      patchState(store, (state) => ({
        projects: [...state.projects, project]
      }));
    },
    updateProject(updatedProject: Project) {
      patchState(store, (state) => ({
        projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
      }));
    },
    removeProject(projectId: string) {
      patchState(store, (state) => ({
        projects: state.projects.filter(p => p.id !== projectId)
      }));
    },
    setProjects(projects: Project[]) {
      patchState(store, { projects });
    },
    selectProject(projectId: string | null) {
      patchState(store, { selectedProjectId: projectId });
    },
    completeStep(projectId: string, stepId: string) {
      patchState(store, (state) => ({
        projects: state.projects.map(p => {
          if (p.id === projectId) {
            return {
              ...p,
              steps: p.steps.map(s => s.id === stepId ? { ...s, isCompleted: true } : s)
            };
          }
          return p;
        })
      }));
    },
    contributeToProject(projectId: string, amount: number) {
      patchState(store, (state) => ({
        projects: state.projects.map(p => 
          p.id === projectId 
            ? { ...p, currentAmount: p.currentAmount + amount }
            : p
        )
      }));
    },
    clearProjects() {
      patchState(store, initialState);
    }
  }))
);

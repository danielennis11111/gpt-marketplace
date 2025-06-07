import { GptProject } from '../types';
import gptsData from '../data/gpts.json';

export async function fetchGptProjects(): Promise<GptProject[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(gptsData.projects), 400);
  });
}

export async function fetchGptProjectById(id: string): Promise<GptProject | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(gptsData.projects.find((p: GptProject) => p.id === id)), 400);
  });
} 
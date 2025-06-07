import { gpts, GptProject } from '../data/gpts';

export async function fetchGptProjects(): Promise<GptProject[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(gpts), 400);
  });
}

export async function fetchGptProjectById(id: string): Promise<GptProject | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(gpts.find(p => p.id === id)), 400);
  });
} 
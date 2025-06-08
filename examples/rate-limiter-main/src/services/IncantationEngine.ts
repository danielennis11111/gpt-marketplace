/**
 * 🏗️ Incantation Engine - Natural Language Programming Patterns
 * 
 * Based on years of prompt engineering discoveries and programming wisdom.
 * These are the "incantations" that consistently produce better AI outputs.
 */

import { PromptPattern, PatternCombination, ContextualIncantation, IncantationLibrary } from '../types/character';

export class IncantationEngine {
  private patterns: Map<string, PromptPattern> = new Map();
  private combinations: Map<string, PatternCombination> = new Map();
  private contextual: Map<string, ContextualIncantation> = new Map();

  constructor() {
    this.initializePatterns();
    this.initializeCombinations();
    this.initializeContextualMappings();
  }

  private initializePatterns() {
    // 🧠 REASONING PATTERNS
    this.addPattern({
      name: 'chain-of-thought',
      category: 'reasoning',
      template: 'Let me think through this step by step:\n\n1. First, I need to {step1}\n2. Then I should {step2}\n3. Finally, {step3}\n\nTherefore, {conclusion}',
      variables: ['step1', 'step2', 'step3', 'conclusion'],
      examples: [
        {
          input: 'How do I debug this React component?',
          output: 'Let me think through this step by step:\n\n1. First, I need to identify what the component should do\n2. Then I should check what it\'s actually doing\n3. Finally, compare the difference and fix the issue',
          context: 'Technical debugging'
        }
      ],
      effectiveness: 0.9
    });

    this.addPattern({
      name: 'stream-of-consciousness',
      category: 'reasoning',
      template: 'I\'m thinking about {topic} and {current_thought}... Now I\'m considering {next_thought}... This makes me realize {insight}...',
      variables: ['topic', 'current_thought', 'next_thought', 'insight'],
      examples: [
        {
          input: 'How should we approach this project?',
          output: 'I\'m thinking about this project and how it connects to our broader goals... Now I\'m considering what the biggest risks might be... This makes me realize we should start with the riskiest assumptions first...',
          context: 'Strategic planning'
        }
      ],
      effectiveness: 0.8
    });

    this.addPattern({
      name: 'perspective-taking',
      category: 'reasoning',
      template: 'From the perspective of {stakeholder}, this {situation} would {impact}. However, from {other_stakeholder}\'s view, {alternative_view}.',
      variables: ['stakeholder', 'situation', 'impact', 'other_stakeholder', 'alternative_view'],
      examples: [],
      effectiveness: 0.85
    });

    // 🎨 CREATIVITY PATTERNS
    this.addPattern({
      name: 'assumption-reversal',
      category: 'creativity',
      template: 'What if we assumed the opposite of {common_assumption}? If {reversed_assumption} were true, then we could {possibility}.',
      variables: ['common_assumption', 'reversed_assumption', 'possibility'],
      examples: [],
      effectiveness: 0.8
    });

    this.addPattern({
      name: 'metaphor-bridge',
      category: 'creativity',
      template: 'This problem is like {metaphor} because {similarity}. If we treat it like {metaphor}, we could {solution_approach}.',
      variables: ['metaphor', 'similarity', 'solution_approach'],
      examples: [],
      effectiveness: 0.75
    });

    this.addPattern({
      name: 'worst-case-reversal',
      category: 'creativity',
      template: 'If we wanted this to fail spectacularly, we would {failure_actions}. Therefore, to succeed, we should {success_actions}.',
      variables: ['failure_actions', 'success_actions'],
      examples: [],
      effectiveness: 0.85
    });

    // 🏗️ STRUCTURE PATTERNS
    this.addPattern({
      name: 'pyramid-principle',
      category: 'structure',
      template: '{main_conclusion}\n\nThis is supported by three key points:\n1. {supporting_point_1}\n2. {supporting_point_2}\n3. {supporting_point_3}\n\nIn detail: {detailed_explanation}',
      variables: ['main_conclusion', 'supporting_point_1', 'supporting_point_2', 'supporting_point_3', 'detailed_explanation'],
      examples: [],
      effectiveness: 0.9
    });

    this.addPattern({
      name: 'problem-solution-benefit',
      category: 'structure',
      template: '**Problem:** {problem_statement}\n\n**Solution:** {solution_description}\n\n**Benefits:** {key_benefits}\n\n**Implementation:** {implementation_steps}',
      variables: ['problem_statement', 'solution_description', 'key_benefits', 'implementation_steps'],
      examples: [],
      effectiveness: 0.85
    });

    this.addPattern({
      name: 'progressive-disclosure',
      category: 'structure',
      template: 'Here\'s the quick answer: {quick_answer}\n\nIf you want more detail: {medium_detail}\n\nFor complete understanding: {full_explanation}',
      variables: ['quick_answer', 'medium_detail', 'full_explanation'],
      examples: [],
      effectiveness: 0.8
    });

    // 🎭 ROLEPLAY PATTERNS
    this.addPattern({
      name: 'expert-persona',
      category: 'roleplay',
      template: 'As a {expert_type} with {years} years of experience in {domain}, I can tell you that {expert_opinion}. In my experience, {experience_story}.',
      variables: ['expert_type', 'years', 'domain', 'expert_opinion', 'experience_story'],
      examples: [],
      effectiveness: 0.85
    });

    this.addPattern({
      name: 'socratic-method',
      category: 'roleplay',
      template: 'Let me ask you some questions to help us think through this:\n\n1. What do you think {question_1}?\n2. How might {question_2}?\n3. What would happen if {question_3}?',
      variables: ['question_1', 'question_2', 'question_3'],
      examples: [],
      effectiveness: 0.8
    });

    // 📏 CONSTRAINT PATTERNS
    this.addPattern({
      name: 'forced-constraint',
      category: 'constraint',
      template: 'If I could only {constraint} to solve this, I would {constrained_solution}. This constraint actually reveals {insight}.',
      variables: ['constraint', 'constrained_solution', 'insight'],
      examples: [],
      effectiveness: 0.75
    });

    this.addPattern({
      name: 'resource-limitation',
      category: 'constraint',
      template: 'Given that we only have {limited_resource}, the most essential elements are {essentials}. Everything else is {nice_to_have}.',
      variables: ['limited_resource', 'essentials', 'nice_to_have'],
      examples: [],
      effectiveness: 0.8
    });

    // 🔧 PROGRAMMING-SPECIFIC PATTERNS
    this.addPattern({
      name: 'rubber-duck-debugging',
      category: 'reasoning',
      template: 'Let me explain this code line by line as if to a rubber duck:\n\nLine {line_number}: {explanation}\nThis should {expected_behavior}\nBut instead {actual_behavior}\nSo the issue is likely {hypothesis}',
      variables: ['line_number', 'explanation', 'expected_behavior', 'actual_behavior', 'hypothesis'],
      examples: [],
      effectiveness: 0.9
    });

    this.addPattern({
      name: 'code-review-perspective',
      category: 'reasoning',
      template: 'If I were reviewing this code, I would look for:\n1. {code_aspect_1}\n2. {code_aspect_2}\n3. {code_aspect_3}\n\nThe biggest concern would be {main_concern} because {reasoning}.',
      variables: ['code_aspect_1', 'code_aspect_2', 'code_aspect_3', 'main_concern', 'reasoning'],
      examples: [],
      effectiveness: 0.85
    });

    this.addPattern({
      name: 'architecture-first',
      category: 'structure',
      template: 'Before writing any code, let\'s design the architecture:\n\n**Components:** {components}\n**Data Flow:** {data_flow}\n**Interfaces:** {interfaces}\n**Dependencies:** {dependencies}',
      variables: ['components', 'data_flow', 'interfaces', 'dependencies'],
      examples: [],
      effectiveness: 0.9
    });

    // 🎯 GOAL-ORIENTED PATTERNS
    this.addPattern({
      name: 'working-backwards',
      category: 'reasoning',
      template: 'Starting from the desired outcome {desired_outcome}, I need to work backwards:\n\nTo achieve {desired_outcome}, I need {prerequisite_1}\nTo get {prerequisite_1}, I need {prerequisite_2}\nTo get {prerequisite_2}, I need {starting_point}',
      variables: ['desired_outcome', 'prerequisite_1', 'prerequisite_2', 'starting_point'],
      examples: [],
      effectiveness: 0.85
    });

    this.addPattern({
      name: 'mvp-thinking',
      category: 'constraint',
      template: 'The absolute minimum viable version of {solution} would be {mvp_description}. This proves {core_hypothesis}. We can add {enhancements} later.',
      variables: ['solution', 'mvp_description', 'core_hypothesis', 'enhancements'],
      examples: [],
      effectiveness: 0.8
    });
  }

  private initializeCombinations() {
    this.addCombination({
      name: 'deep-technical-analysis',
      patterns: ['chain-of-thought', 'rubber-duck-debugging', 'code-review-perspective'],
      order: 'sequential',
      useCase: 'Complex debugging and code analysis'
    });

    this.addCombination({
      name: 'strategic-planning',
      patterns: ['working-backwards', 'perspective-taking', 'problem-solution-benefit'],
      order: 'layered',
      useCase: 'High-level project planning and strategy'
    });

    this.addCombination({
      name: 'creative-problem-solving',
      patterns: ['assumption-reversal', 'metaphor-bridge', 'worst-case-reversal'],
      order: 'conditional',
      useCase: 'Breaking through creative blocks'
    });

    this.addCombination({
      name: 'architecture-design',
      patterns: ['architecture-first', 'mvp-thinking', 'forced-constraint'],
      order: 'sequential',
      useCase: 'Software architecture and system design'
    });
  }

  private initializeContextualMappings() {
    this.addContextualMapping({
      context: 'code-debugging',
      recommendedPatterns: ['rubber-duck-debugging', 'chain-of-thought', 'code-review-perspective'],
      avoidPatterns: ['metaphor-bridge', 'worst-case-reversal']
    });

    this.addContextualMapping({
      context: 'project-planning',
      recommendedPatterns: ['working-backwards', 'perspective-taking', 'problem-solution-benefit', 'mvp-thinking'],
      avoidPatterns: ['rubber-duck-debugging']
    });

    this.addContextualMapping({
      context: 'creative-brainstorming',
      recommendedPatterns: ['assumption-reversal', 'metaphor-bridge', 'worst-case-reversal'],
      avoidPatterns: ['chain-of-thought', 'pyramid-principle']
    });

    this.addContextualMapping({
      context: 'technical-explanation',
      recommendedPatterns: ['progressive-disclosure', 'pyramid-principle', 'architecture-first'],
      avoidPatterns: ['stream-of-consciousness', 'assumption-reversal']
    });

    this.addContextualMapping({
      context: 'learning-conversation',
      recommendedPatterns: ['socratic-method', 'progressive-disclosure', 'expert-persona'],
      avoidPatterns: ['forced-constraint', 'worst-case-reversal']
    });
  }

  // Public API
  addPattern(pattern: PromptPattern): void {
    this.patterns.set(pattern.name, pattern);
  }

  addCombination(combination: PatternCombination): void {
    this.combinations.set(combination.name, combination);
  }

  addContextualMapping(mapping: ContextualIncantation): void {
    this.contextual.set(mapping.context, mapping);
  }

  getPattern(name: string): PromptPattern | null {
    return this.patterns.get(name) || null;
  }

  getCombination(name: string): PatternCombination | null {
    return this.combinations.get(name) || null;
  }

  getContextualMapping(context: string): ContextualIncantation | null {
    return this.contextual.get(context) || null;
  }

  // Smart pattern recommendation
  recommendPatterns(context: string, userQuery: string): string[] {
    const contextMapping = this.getContextualMapping(context);
    if (contextMapping) {
      return contextMapping.recommendedPatterns;
    }

    // Fallback: analyze query for pattern hints
    const query = userQuery.toLowerCase();
    const recommendations: string[] = [];

    if (query.includes('debug') || query.includes('error') || query.includes('bug')) {
      recommendations.push('rubber-duck-debugging', 'chain-of-thought');
    }
    
    if (query.includes('plan') || query.includes('strategy') || query.includes('approach')) {
      recommendations.push('working-backwards', 'problem-solution-benefit');
    }
    
    if (query.includes('creative') || query.includes('brainstorm') || query.includes('idea')) {
      recommendations.push('assumption-reversal', 'metaphor-bridge');
    }
    
    if (query.includes('explain') || query.includes('understand') || query.includes('learn')) {
      recommendations.push('progressive-disclosure', 'socratic-method');
    }

    return recommendations.length > 0 ? recommendations : ['chain-of-thought'];
  }

  // Generate enhanced prompt with patterns
  enhancePrompt(basePrompt: string, patterns: string[], variables: Record<string, string> = {}): string {
    let enhancedPrompt = basePrompt;

    patterns.forEach(patternName => {
      const pattern = this.getPattern(patternName);
      if (pattern) {
        let patternTemplate = pattern.template;
        
        // Substitute variables
        pattern.variables.forEach(variable => {
          if (variables[variable]) {
            patternTemplate = patternTemplate.replace(`{${variable}}`, variables[variable]);
          }
        });

        enhancedPrompt += `\n\n## ${pattern.name.replace(/-/g, ' ').toUpperCase()}\n${patternTemplate}`;
      }
    });

    return enhancedPrompt;
  }

  // Get all patterns by category
  getPatternsByCategory(category: PromptPattern['category']): PromptPattern[] {
    return Array.from(this.patterns.values()).filter(p => p.category === category);
  }

  // Export library for character definitions
  exportLibrary(): IncantationLibrary {
    return {
      patterns: Array.from(this.patterns.values()),
      combinations: Array.from(this.combinations.values()),
      contextual: Array.from(this.contextual.values())
    };
  }

  // Import library (for loading character definitions)
  importLibrary(library: IncantationLibrary): void {
    library.patterns.forEach(pattern => this.addPattern(pattern));
    library.combinations.forEach(combination => this.addCombination(combination));
    library.contextual.forEach(mapping => this.addContextualMapping(mapping));
  }
}

// Singleton instance
export const incantationEngine = new IncantationEngine(); 
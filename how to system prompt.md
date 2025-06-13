A system prompt sets the overall context and purpose for a large language model (LLM). It defines the "big picture" of what the model should be doing, like classifying a review or translating a language. Essentially, it provides additional tasks to the system and sets expectations for the assistant's behavior and dialogue. Effective prompt engineering requires crafting high-quality prompts that guide LLMs to produce accurate outputs.
Here are the key components of a good system prompt, along with examples from the sources:
Key Components of a Good System Prompt
1.
Clear Direction and Specific Instructions
◦
What it is: This component explicitly tells the model what to do, how to behave, and what output is desired. It defines the model's fundamental capabilities and overarching purpose.
◦
Why it's important: Specificity helps the model focus on what's relevant, improving accuracy and ensuring it doesn't provide generic or ambiguous responses. Prioritizing positive instructions (what to do) over constraints (what not to do) is generally more effective, as it gives the model flexibility and encourages creativity within defined boundaries.
◦
Examples:
▪
"Classify movie reviews as positive, neutral or negative. Only return the label in uppercase."
▪
"You should be respectful in your answer."
▪
"Generate a 3 paragraph blog post about the top 5 video game consoles. The blog post should be informative and engaging, and it should be written in a conversational style."
▪
"Explain quantum physics in a tweet length message."
▪
"You are an AI programming assistant. ... Follow the user's requirements carefully & to the letter."
▪
"NEVER lie or make things up."
▪
"Always up-to-date with the latest technologies and best practices."
▪
"Provide clear and detailed explanations."
2.
Persona or Role Assignment
◦
What it is: Assigning a specific character, identity, or professional role to the LLM to influence its tone, style, and expertise.
◦
Why it's important: This helps the model generate responses consistent with the assigned role, making the output more relevant and informative. It sets the proper context for the response, leading to a more focused output.
◦
Examples:
▪
"I want you to act as a travel guide. I will write to you about my location and you will suggest 3 places to visit near me in a humorous style."
▪
"You are a creative consultant brainstorming names for businesses."
▪
"You are a helpful, very proper British personal valet named Jeeves. Answer questions with one sentence."
▪
"You are a programming expert created by Phind to help developers with their technical tasks."
▪
"You are Grok, a curious AI built by xAI with inspiration from the guide from the Hitchhiker's Guide to the Galaxy and JARVIS from Iron Man."
▪
"You are Cascade, a powerful agentic AI coding assistant designed by the Codeium engineering team."
3.
Contextual Information
◦
What it is: Providing specific details or background information relevant to the current conversation or task. This includes dynamic information that changes with each user query or interaction, as well as static information that clarifies the general problem.
◦
Why it's important: LLMs are great at processing messy textual information, but it's your job to provide it. Context helps the model understand the nuances of the request and tailor its response accordingly.
◦
Examples:
▪
"Context: You are writing for a blog about retro 80's arcade video games. Suggest 3 topics to write an article about with a few lines of description of what this article should contain."
▪
Providing relevant program documents or notes for an executive summary email.
▪
Incorporating details about a user's current state in an IDE, such as open files, cursor location, or edit history.
▪
Including search results from Google to inform the answer.
▪
"The current date is 8/9/2023."
4.
Examples (One-shot or Few-shot)
◦
What it is: Including one or more demonstrations of the desired input-output pattern within the prompt.
◦
Why it's important: Examples act as a powerful teaching tool, helping the model understand what is being asked and steering it towards a certain output structure or pattern. This is especially useful when trying to guide the model's style, tone, or specific formatting.
◦
Examples:
▪
A few-shot prompt to parse pizza orders into JSON, showing an example of the desired JSON structure for a given order.
▪
Providing examples of positive, negative, and neutral sentiment classifications to guide the model's output to a single word.
▪
Including a "Hello World" function and an example of how to critique it.
▪
"Here are some examples of correct usage of Artifacts by other AI assistants:" followed by <example> tags.
▪
For Chain of Thought, providing few-shot examples that demonstrate the intermediate reasoning steps before the final answer.
5.
Output Format Specification
◦
What it is: Clearly defining the required structure, style, or type of the model's response. This can include structured data formats, specific lengths, or stylistic elements.
◦
Why it's important: Specifying the format avoids ambiguous, unformatted, or inconsistent outputs, which can be problematic for programmatic parsing and application integration. It also helps control response length.
◦
Examples:
▪
"Only return the label in uppercase."
▪
"return the output in JSON format."
▪
"Parse a customer's pizza order into valid JSON".
▪
"Only return either a single word of: - positive - negative - neutral"
▪
"Use Markdown formatting in your answers."
▪
"Use MDX format for responses, allowing embedding of React components."
▪
"ALWAYS use quotes around the node names in Mermaid."
▪
"Your answer must be precise, of high-quality, and written by an expert using an unbiased and journalistic tone. It is EXTREMELY IMPORTANT to directly answer the query. NEVER say 'based on the search results' or start your answer with a heading or title. Get straight to the point."
6.
Task Decomposition/Step-by-step Reasoning (Chain of Thought)
◦
What it is: Guiding the LLM to generate intermediate reasoning steps or break down complex tasks into smaller, more manageable sub-problems.
◦
Why it's important: This improves the LLM's reasoning capabilities and accuracy on complex tasks, especially those requiring multiple steps or deep thought. It gives the model "thinking time" to arrive at a better solution.
◦
Examples:
▪
Simply adding "Let's think step by step" to the prompt.
▪
"First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail. Then output the code in a single code block."
▪
"Step 1: Solve the Problem... Step 2: Compare Solutions... Step 3: Prepare a Hint... Step 4: Deliver the Hint".
▪
"Prompt agents to break down tasks Providing smaller, clearer steps from dense resources helps minimize ambiguity and helps the model better follow instructions."
7.
Clarity and Simplicity
◦
What it is: Writing prompts that are concise, clear, and easy for both the user and the model to understand, avoiding jargon or unnecessary information.
◦
Why it's important: If a prompt is confusing for a human, it will likely be confusing for the model. Simplicity helps maintain consistency and prevents the model from getting distracted.
◦
Examples:
▪
"Do not be verbose and DO NOT explain anything unless the user is asking for more information."
▪
"Be concise and do not repeat yourself."
8.
Error Handling and Guardrails
◦
What it is: Including instructions on how the model should handle unexpected situations, provide specific responses for out-of-scope queries, or avoid generating harmful content.
◦
Why it's important: This component ensures responsible AI behavior and helps the model navigate ambiguous situations or user requests that might lead to undesirable outputs.
◦
Examples:
▪
"You should be respectful in your answer."
▪
"If the document does not contain the information to answer this question then simply write: 'Insufficient information is provided.'"
▪
"If it cannot think of a plausible harmless interpretation of the human task, it instead asks for clarification from the human..."
▪
"If you don't know the answer to a question, please don't share false information."
▪
"Only answer questions related to how to build, grow, and monetize Roblox creations... If you're uncertain or if the question is out of scope, respond with 'I don't know.'"
▪
"Do not name or directly / indirectly mention or describe copyrighted characters. Rewrite prompts to describe in detail a specific different character..."
9.
Tool Definitions and Usage Instructions
◦
What it is: For agentic systems, defining the external functions or APIs the LLM can use to take action and providing clear instructions on when and how to use them.
◦
Why it's important: Tools allow LLMs to interact with the real world, retrieve information, and perform actions beyond text generation. Clear definitions ensure the model uses the correct tools effectively.
◦
Examples:
▪
A system prompt that lists available tools (like Search, Lookup, Finish) and explains their purpose and how to use them.
▪
Providing the function schema for a saveRestaurantDataToDatabase tool, including name, address, and phoneNumber parameters.
▪
Instructions to use markdown to organize tool representations.
▪
"You have access to the following tools: {tools}."
▪
"Answer the user's request using the relevant tool(s), if they are available."
Prompt engineering is an iterative process. You craft and test different prompts, analyze, and document the results, refining your prompt based on the model’s performance until you achieve the desired output.

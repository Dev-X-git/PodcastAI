from vertexai.generative_models import GenerativeModel, GenerationConfig
import vertexai
import json
from google.api_core.exceptions import ResourceExhausted
import time

# Configuration for generating conversation responses
generation_config = GenerationConfig(
    max_output_tokens=8192,
    temperature=1,
    top_p=0.95,
    response_mime_type="application/json",
    response_schema={"type": "ARRAY", "items": {"type": "OBJECT", "properties": {"speaker": {"type": "STRING"}, "text": {"type": "STRING"}}}},
)


def generate_conversation(prompt_text, article, userPrompt):
    """
    Generates a conversation based on the provided prompt, article, and user input.

    Args:
        prompt_text (str): The system instruction for the generative model.
        article (str): The article content to be used in the conversation.
        userPrompt (str): The user's input prompt.

    Returns:
        list: A list of dictionaries containing the conversation with speakers and text.
    """
    # Initialize the Vertex AI with the specified project and location
    vertexai.init(project="bookcastlm", location="us-central1")
    # Create a generative model instance with the specified system instruction

    model = GenerativeModel(
        "gemini-1.5-flash-001",
        system_instruction=[prompt_text]
    )

    retry_count = 0
    delay = 2  # delay in seconds

    while True:
        try:
            responses = model.generate_content(
                [article,userPrompt],
                generation_config=generation_config,
                stream=False,
            )
            try:
                 # Extract the text from the response
                json_response = responses.candidates[0].content.parts[0].text
            except IndexError:
                print("No response generated at conversation, retrying...")
                continue 
            try:
                # Parse the JSON response
                json_data = json.loads(json_response)
            except json.decoder.JSONDecodeError:
                print("JSONDecodeError encountered at conversation, retrying...")
                continue
            # Assign speakers alternately in the conversation
            for i, item in enumerate(json_data):
                if i % 2 == 0:
                    item['speaker'] = 'person1'
                else:
                    item['speaker'] = 'person2'
            return json_data
            break  # If successful, break the loop
        except Exception as e:  # Catch any other exceptions
            if retry_count >= 8:  # Maximum retries
                raise  # If maximum retries exceeded, raise the exception
            else:
                print(f"Error at generate conversation: {e}. Retrying in {delay} seconds...")
                time.sleep(delay)
                retry_count += 1
                delay *= 2  # Double the delay for exponential backoff

# Configuration for generating category responses
generation_config_cate = GenerationConfig(
    max_output_tokens=8192,
    temperature=1,
    top_p=0.95,
    response_mime_type="application/json",
    response_schema={"type": "STRING"},
)
    
def generate_category(text):
    """
    Generates a category for the given text.

    Args:
        text (str): The text for which the category is to be generated.

    Returns:
        str: The generated category as a string.
    """
    # Initialize the Vertex AI with the specified project and location
    vertexai.init(project="bookcastlm", location="us-central1")
    # Create a generative model instance with a specific system instruction
    model = GenerativeModel(
        "gemini-1.5-flash-001",
        system_instruction=["Give me category of this book title."]
    )
    retry_count = 0
    delay = 2  # delay in seconds

    while True:
        try:
            # Generate content using the model
            responses = model.generate_content(
                [text],
                generation_config=generation_config_cate,
                stream=False,
            )
            try:
                # Extract the text from the response
                json_response = responses.candidates[0].content.parts[0].text
            except IndexError:
                print("No response generated at category, retrying...")
                continue 
            # Clean up the response by removing quotes
            json_response = json_response.replace('"', '')
            return json_response
            break  # If successful, break the loop
        except Exception as e:  # Catch any other exceptions
            if retry_count >= 8:  # Maximum retries
                raise  # If maximum retries exceeded, raise the exception
            else:
                print(f"Error at category: {e}. Retrying in {delay} seconds...")
                time.sleep(delay)
                retry_count += 1
                delay *= 2  # Double the delay for exponential backoff
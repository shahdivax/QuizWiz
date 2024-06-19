from flask import Flask, render_template, request, jsonify
from llama_index.core import ServiceContext, set_global_service_context
from llama_index.legacy.embeddings import GeminiEmbedding
from llama_index.llms.gemini import Gemini
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import Settings
import os

GOOGLE_API_KEY = "AIzaSyAoEdYoQvJ6806CqTSvpU5UM_O2NO9x-O0"  # add your GOOGLE API key here
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

Settings.embed_model = GeminiEmbedding(
    model_name="models/text-embedding-004", api_key=GOOGLE_API_KEY
)
Settings.llm = Gemini(api_key=GOOGLE_API_KEY, model_name="models/gemini-1.5-flash-latest")

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)

chat_engine = index.as_chat_engine(chat_mode="condense_question", streaming=True)

app = Flask(__name__)

@app.route("/")
def index():
    chat_engine.reset()
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json["input"]
    response = chat_engine.stream_chat(user_input)
    response_ai = []
    output_texts = [chunk for chunk in response.response_gen]
    response_ai.append(''.join(output_texts))
    chat_engine.reset()
    return jsonify({"output": response_ai})

if __name__ == "__main__":
    app.run(debug=True)
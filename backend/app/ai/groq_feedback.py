from flask import request, current_app, jsonify
from groq import Groq
from . import feedback_routes

client = Groq()

@feedback_routes.route ('/predict', methods=['POST'])
def predict():
    data = request.json
    scheine = data.get('scheine')
    if not scheine:
        return jsonify({'status': 'error', 'message' : 'Keine Lottoscheindaten übergeben.'}), 400
    
    # 7x7-Gitter für visuelle Referenz
    grid = """
    1  2  3  4  5  6  7
    8  9  10 11 12 13 14
    15 16 17 18 19 20 21
    22 23 24 25 26 27 28
    29 30 31 32 33 34 35
    36 37 38 39 40 41 42
    43 44 45 46 47 48 49
    """

    numbers = "\n".join([str(schein["numbers"]) for schein in scheine])
    
    message = f"""
    Analysiere die folgenden Lottoscheine, die in einem 7x7-Gitter organisiert sind. 
    Identifiziere visuelle Muster, Anomalien oder Trends, die möglicherweise relevant sind.
    Lottoscheine:
    {scheine}
    """

    # Rollenbeschreibung und spezifischer Prompt
    prompt = f"""
    Du bist eine KI-Expertin für die Analyse von Lottoscheinen. 
    Deine Hauptaufgabe ist es, visuelle und numerische Muster in den folgenden Zahlen zu analysieren. 
    Die Zahlen sind auf einem 7x7-Gitter angeordnet:

    Gitter: {grid}

    Deine Aufgaben:
    1. Erkenne optische Muster (z. B. Linien, Kreuze, Buchstaben, Formen).
    2. Analysiere numerische Muster (gerade/ungerade, Primzahlen, Sequenzen, Cluster).
    3. Bewerte die Verteilung im Zahlenbereich 1 bis 49.
    4. Schätze, wie zufällig die Auswahl ist, auf einer Skala von 0-100%.
    5. Analysiere emotionale Aspekte (z. B. Geburtstage, Glückszahlen, menschlich zufällige Muster).
    6. Gib Feedback und Empfehlungen.
    """
    
    prediction = predict_with_language_model(message, prompt)
    return jsonify({'prediction': prediction})

def predict_with_language_model(message, prompt):
    chat_completion = client.chat.completions.create(
        messages=[
        # Set an optional system message. This sets the behavior of the
        # assistant and can be used to provide specific instructions for
        # how it should behave throughout the conversation.
            {
                'role': 'system',
                'content': prompt
            },
            {
                "role": "user",
                "content": message,
            }
        ],
        #model="mixtral-8x7b-32768",
        model="llama-3.2-90b-vision-preview",
        temperature=0.5,
        max_tokens=1024,
        stream=False,
    )
    #for chunk in stream:
       # prediction += chunk.choices[0].message.content
    prediction = chat_completion.choices[0].message.content
    return prediction

from flask import request, jsonify
from groq import Groq
from . import feedback_routes, login_required, get_jwt_identity

client = Groq()

@feedback_routes.route ('/predict', methods=['POST'])
@login_required
def predict(user_id):
    student_id = get_jwt_identity()
    data = request.json
    scheine = data.get('scheine')
    coded_feedback = data.get('codedFeedback')

    if not scheine or not isinstance(scheine, list):
        return jsonify({'status': 'error', 'message' : 'Keine Lottoscheindaten übergeben.'}), 400
    
    if not coded_feedback or not isinstance(coded_feedback, str):
        return jsonify({'status': 'error', 'message' : 'Ungültiges oder fehlendes codedFeedback.'}), 400
    
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
    
    message = f"""
    Analysiere die folgenden Lottoscheine basierend auf der vorangegangenen Backend-Analyse:

    Backend-Analyse:
    {coded_feedback}

    Lottoscheine:
    {scheine}
    """

    # Rollenbeschreibung und spezifischer Prompt
    prompt = f"""
    Du bist eine spezialisierte KI für die Analyse von Lottoscheinen, 
    die sowohl numerische als auch visuelle Muster identifiziert. 
    Die Zahlen sind auf einem 7x7-Gitter organisiert:

    Gitter: {grid}

    **Deine Aufgaben:**
    1. Identifiziere visuelle Muster wie Buchstaben (z. B. O, L, Y), geometrische Formen (z. B. Kreuze, Quadrate, Linien) oder andere auffällige Anordnungen basiernd auf der Verteilugn auf dem Gitter.
    2. Analysiere numerische Muster wie geraden/ungeraden Verteilungen, Primzahlen, aufeinanderfolgende Sequenzen oder Cluster (im Gitter).
    3. Bewerte die Verteilung der Zahlen im Bereich 1 bis 49. Welche Zahlenbereiche fehlen oder werden bevorzugt?
    4. Bewerte die Zufälligkeit der Auswahl auf einer Skala von 0 bis 100% unter Berücksichtigung von Mustern und Verteilungen.
    5. Analysiere emotionale Aspekte, wie Geburtstage, Glückszahlen oder andere menschlich zufällige Muster.
    6. Gib Feedback und klare Empfehlungen zur Verbesserung der Zufälligkeit oder Verteilung der Zahlen.
    """
    
    prediction = predict_with_language_model(message, prompt)
    return jsonify({'prediction': prediction})

def predict_with_language_model(message, prompt):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                'role': 'system',
                'content': prompt
            },
            {
                "role": "user",
                "content": message,
            }
        ],
        model="llama-3.3-70b-versatile",
        #model="llama-3.2-90b-vision-preview",
        temperature=0.5,
        max_tokens=1024,
        stream=False,
    )
    prediction = chat_completion.choices[0].message.content
    return prediction

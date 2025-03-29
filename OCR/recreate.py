import json
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def plot_text_annotations(text_annotations):
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.set_xlim(0, 1200)
    ax.set_ylim(800, 0)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_frame_on(False)
    
    for annotation in text_annotations:
        text = annotation['description']
        vertices = annotation['boundingPoly']['vertices']
        x_min = min(v['x'] for v in vertices)
        y_min = min(v['y'] for v in vertices)
        x_max = max(v['x'] for v in vertices)
        y_max = max(v['y'] for v in vertices)
        
        ax.add_patch(
            patches.Rectangle(
                (x_min, y_min), x_max - x_min, y_max - y_min,
                linewidth=1, edgecolor='blue', facecolor='none'
            )
        )
        ax.text(x_min, y_min - 2, text, fontsize=10, verticalalignment='top', color='black')
    
    plt.show()

# Example data from textAnnotations
text_annotations = [
    {'description': 'Diwali', 'boundingPoly': {'vertices': [{'x': 501, 'y': 14}, {'x': 639, 'y': 14}, {'x': 639, 'y': 50}, {'x': 501, 'y': 50}]}},
    {'description': 'festival', 'boundingPoly': {'vertices': [{'x': 597, 'y': 116}, {'x': 746, 'y': 115}, {'x': 746, 'y': 173}, {'x': 597, 'y': 174}]}}
    # Add more extracted annotations here
]

plot_text_annotations(text_annotations)

import urllib.request
import json
import random

def generate_nashik_trips():
    overpass_url = 'https://overpass-api.de/api/interpreter'
    # Fetch primary, secondary, and tertiary roads around Nashik
    query = """
    [out:json];
    area["name"="Nashik"]->.searchArea;
    (
      node["highway"](area.searchArea);
      way["highway"~"primary|secondary|tertiary|trunk|residential"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
    """
    
    print("Fetching roads data for Nashik...")
    req = urllib.request.Request(overpass_url, data=query.encode('utf-8'))
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print("Error fetching data:", e)
        return

    nodes = {}
    ways = []

    # Parse nodes and ways
    for element in data['elements']:
        if element['type'] == 'node':
            nodes[element['id']] = [element['lon'], element['lat']]
        elif element['type'] == 'way':
            if 'nodes' in element:
                ways.append(element['nodes'])

    if not ways:
        print("No roads found. Check the query.")
        return

    # Generate synthetic trips along these ways
    trips = []
    
    print(f"Generating synthetic trips from {len(ways)} ways...")
    for i in range(150):  # Generate 150 trips
        # Pick a random way
        way = random.choice(ways)
        if len(way) < 2:
            continue
            
        path = []
        timestamps = []
        
        current_time = random.uniform(0, 500)  # Start time
        
        for node_id in way:
            if node_id in nodes:
                point = nodes[node_id]
                path.append(point)
                timestamps.append(current_time)
                current_time += random.uniform(5, 15) # random time to travel between nodes

        trips.append({
            "vendor": random.choice([0, 1]), # Used for color
            "path": path,
            "timestamps": timestamps
        })

    with open('nashik_trips.json', 'w') as f:
        json.dump(trips, f)
        
    print(f"Generated {len(trips)} trips and saved to nashik_trips.json")

if __name__ == '__main__':
    generate_nashik_trips()

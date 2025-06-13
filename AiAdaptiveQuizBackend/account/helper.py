

def extract_first_last_name(full_name):
    if not full_name:
        return "", ""
    parts = full_name.split()
    first_name = parts[0]
    last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''
    return first_name, last_name
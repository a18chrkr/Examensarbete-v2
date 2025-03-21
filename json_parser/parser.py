# This script was created in PyCharm together with the pandas package
# If you want to install pandas on your computer seperately, you can
# do it here: https://pandas.pydata.org/

import pandas as pd

# Byt ut filvägen till den fil du önskar parsa
path = 'abl1.txt'

# Läser och delar upp datan i lästa filen
df = pd.read_csv(path, sep='\t', dtype=str)

# Konverterar filen till json med listor
json_output = df.to_json(orient='records', indent=4)

# Skapar ny json-fil med datan
json_file = 'abl1.json' # GLÖM EJ ÄNDRA NAMN PÅ NYA FILEN
with open(json_file, 'w') as f:
    f.write(json_output)

print(f'Converted {path} to {json_file}')

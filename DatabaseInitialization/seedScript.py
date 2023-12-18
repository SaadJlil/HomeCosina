from openpyxl import load_workbook 
from openpyxl import Workbook 
import json
import uuid
import csv
import psycopg2
from progress.bar import Bar 
import requests 
import sys
from dotenv import dotenv_values

# Load environment variables from the .env file
env_variables = dotenv_values("./../Mvp/.env")

# Access the variables from the dictionary
DATABASE_URL = env_variables.get("SEEDING_DATABASE_URL")

if len(sys.argv) > 1:
        userId = sys.argv[1]
else:
    raise("No userId has been received by the seedScript")


def appostrophe_thing(string): 
    if type(string) == str:
        return string.replace("'", "''")
    else: 
        return string



dic_ing = {} 


with open('newIngredients.json') as f:
    elements_ing = json.load(f) 
 
with open('ingComplete.json') as f:
    elements_ing1 = json.load(f) 


elements = []


for element1 in elements_ing:
    element2 = [i for i in elements_ing1 if i['name'] == element1['name']][0]
    element2['Category'] = element1['Category']
    del element2['classified']
    elements.append(element2)
   


con = psycopg2.connect(DATABASE_URL)

curs_obj = con.cursor()

conversion_ing = {'calories': 'calories', 'fat_total_g': 'total_fat', 'fat_saturated_g': 'sat_fat', 'protein_g': 'protein', 'sodium_mg': 'sodium', 'potassium_mg': 'potassium', 'cholesterol_mg': 'cholesterol', 'carbohydrates_total_g': 'carbohydrates', 'fiber_g': 'fiber', 'sugar_g': 'sugar', 'Category': 'category', 'image':'imageUrl', 'name':'name'}
conversion_ing = {v: k for k, v in conversion_ing.items()}


l = ["name" , "calories" , "total_fat" , "sat_fat" , "protein" , "sodium" , "potassium" , "cholesterol" , "carbohydrates" , "fiber" , "sugar" , "category" , "imageUrl"]



bar = Bar('Processing Ingredients', max=len(elements_ing)) 



for element in elements:
    if element['name'] == None:
        continue

    execute_string = ""

    tags_withSpace = [element['name']]
    tags = []
    for splitthing in [tag_withSpace.split(' ') for tag_withSpace in tags_withSpace]:
        tags.extend(splitthing)

    tags = list(dict.fromkeys(tags))

    for tag in tags: 
        if tag == None:
            continue
        insert = "'{}', 'i', '{}', '{}'".format(str(uuid.uuid4()), element['name'], appostrophe_thing(tag))
        execute_string += f'''INSERT INTO "cosinaschema2"."Tag" (tag_id, type, refid, tag) VALUES(''' + insert + ");"


    insert = [appostrophe_thing(element[conversion_ing[i]]) for i in l]
    insert = insert[:-1] #image taken off

    #insert_str = ("'{}',"+("{},"*10)+"'{}','{}'").format(*insert)

    insert_str = ("'{}',"+("{},"*10)+"'{}'").format(*insert) #image taken off

    #execute_string += f'''INSERT INTO "cosinaschema2"."Ingredient"( ingredient_name , calories , total_fat , sat_fat , protein , sodium , potassium , cholesterol , carbohydrates , fiber , sugar , category , main_imageurl) VALUES('''+ insert_str +f''');'''

    execute_string += f'''INSERT INTO "cosinaschema2"."Ingredient"( ingredient_name , calories , total_fat , sat_fat , protein , sodium , potassium , cholesterol , carbohydrates , fiber , sugar , category) VALUES('''+ insert_str +f''');'''


    try:
        curs_obj.execute(execute_string)
    except Exception as e :
        exit()
        con.rollback()

    con.commit()
    bar.next()


print("")







 
def getlastint(string):
    result = 0 
    new_string = string[::-1]
    for i in range(len(new_string)):
        try:
            result += int(new_string[i])*(10**i)
        except:
            break
    return result
      


def cookingTime(directions):
    mins = ['mins', 'min', 'minutes', 'minutes']
    hours = ['hrs', 'hours', 'hour']
    cumul = [0]
    for direction in [d.lower() for d in directions]:
        for str_time in mins:
            min_pos = direction.find(' {}'.format(str_time))
            if min_pos > 0:
                m = getlastint(direction[:min_pos])
                if m != 0:
                    cumul.append(m)
                    break
        for str_time in hours:
            hr_pos = direction.find(' {}'.format(str_time))
            if hr_pos > 0:
                h = getlastint(direction[:hr_pos])
                if h != 0:
                    cumul.append(h*60)
                    break
    return sum(cumul)

dic_ing = {} 

with open('recipeUpgraded.json') as f:
    elements_ing = json.load(f) 

elements = []




con = psycopg2.connect(DATABASE_URL)

curs_obj = con.cursor()

bar = Bar('Processing Recipes', max=len(elements_ing)) 


def appostrophe_thing(string): 
    if type(string) == type('thing'):
        return string.replace("'", "''")
    else: 
        return string
    


def liststr2str(l):
    return (("'{}',"*len(l))[:-1]).format(*[appostrophe_thing(i) for i in l])
  


for element in elements_ing:
    if element['title'] == None:
        continue

    execute_string = ""

    ObjectId = str(element['_id']['$oid'])


    tags_withSpace= [element['title'], *element['NER']]
    tags = []

    try:
        for splitthing in [tag_withSpace.split(' ') for tag_withSpace in tags_withSpace]:
            for word in splitthing:
                tags.append(word.lower())

        tags = list(dict.fromkeys(tags))

    except Exception as e:
        exit()

    for tag in tags: 
        insert = "'{}', 'r', '{}', '{}'".format(str(uuid.uuid4()), ObjectId, appostrophe_thing(tag))
        execute_string += f'''INSERT INTO "cosinaschema2"."Tag" (tag_id, type, refid, tag) VALUES(''' + insert + ");"

    
    NumberTags = len(tags)
    NumberIng = len(element['NER'])

    insert_str = "'{}', ARRAY [{}], '{}', '{}', ARRAY ['{}'], {}, {}, {}".format(ObjectId, liststr2str(element['directions']), userId, appostrophe_thing(element['title'].lower()), appostrophe_thing(element['link']), cookingTime(element['directions']), NumberTags, NumberIng)
    execute_string += f'''INSERT INTO "cosinaschema2"."Recipe"(recipe_id, steps, userid, title, link, cookingtime_min, tag_nb, ing_nb) VALUES('''+ insert_str +f''');'''

    try:
        curs_obj.execute(execute_string)

    except Exception as e :
        exit()
        #con.rollback()
            
    con.commit()
        
    bar.next()




print("")


"""

***************** M-M *************************

"""

unit_ing = {}

with open('newIngredients.json') as f:
    ingsData = json.load(f)


with open('./ingredients_weight.csv', 'r') as file:
    csv_reader = csv.reader(file)
    
    for row in csv_reader:
        unit_ing[row[0]] = float(row[1])
        unit_ing[row[0][0:-1]] = float(row[1])
        unit_ing[row[0]+'s'] = float(row[1])




def appostrophe_thing(string): 
    if type(string) == type('thing'):
        return string.replace("'", "''")
    else: 
        return string


def measurementgen(ing, inglist):
    ignoredCat = ['Spice', 'Oil']
    measured = ingsData[[ingd['name'] for ingd in ingsData].index(ing)]['Category'] in ignoredCat if ing in [ingd['name'] for ingd in ingsData] else False
    measured = True if ing == "water" else measured

    unitstogram = {'c': 250, 'c.': 250, 'cup': 250, 'cup.': 250, 'cups': 250, 'cups.': 250, 'tsp': 4.92, 'tsp.': 4.92, 'teaspoon': 4.92, 'teaspoons': 4.92, 'Tbsp.': 14.78, 'Tbsp': 14.78, 'tbsp': 14.78, 'tbsp.': 14.78, 'tbl': 14.78, 'tbl.': 14.78, 'tb': 14.78, 'tb.': 14.78, 'tablespoon': 14.78, 'tablespoons': 14.78, 'oz': 28.34, 'oz.': 28.34, 'ounce': 28.34, 'ounces': 28.34, 'gram': 1, 'gram.': 1, 'grams': 1, 'grams.': 1, 'g.': 1, 'g': 1, 'lb.': 453.592, 'lb': 453.592, 'lbs.': 453.592, 'lbs': 453.592, 'pound': 453.592, 'pound.': 453.592, 'pounds': 453.592, 'pounds.': 453.592, 'kg.': 1000, 'kg': 1000, 'kilogram': 1000, 'kilogram.':1000, 'kilograms': 1000, 'kilograms': 1000, 'kilograms.': 1000, 'kilo': 1000, 'kilo.': 1000, 'kilos': 1000, 'kilos.': 1000, 'L': 1000, 'l': 1000, "liter": 1000, "liters": 1000}

    CatWeighRatio = {
        "Other" : 1.0,
        "Grain Product" : 0.59,
        "Condiment" : 2.67,
        "Bread" : 0.22,
        "Vegetable" : 1.38,
        "Spice" : 2.16,
        "Herb" : 2.16,
        "Cereal" : 0.796,
        "Legume" : 0.7,
        "Meat" : 1.0,
        "Seafood" : 1.1,
        "Dairy Product" : 1.0,
        "Fruit" : 0.75,
        "Sugar or sugar product" : 1.3,
        "Nut" : 0.48,
        "Oilseed" : 0.885,
        "Oil" : 0.925,
        "Beverage" : 1.0
    }

    units = list(unitstogram.keys())

    weird_values = {'1/2': 1/2, '1/3': 1/3, '2/3': 2/3, '1/4': 1/4, '2/4': 2/4, '3/4': 3/4}
    response = {} 
    for ingredientwm in inglist:
        if ingredientwm.find(ing) != -1 or ingredientwm.find(ing[0:-1]) != -1 or ingredientwm.find(ing+'s') != -1:
            response['presentedstring'] = appostrophe_thing(ingredientwm)
            reverse_ingredientwm = ingredientwm[::-1]
            positionfirst = -1
            for pos_firstint in range(len(ingredientwm)):
                try:
                    int(reverse_ingredientwm[pos_firstint])
                    positionfirst = len(ingredientwm) - pos_firstint
                    break
                except:
                    continue
            if positionfirst != -1:
                listwords_aft = ingredientwm[positionfirst:].split()
                if len(listwords_aft) > 0:
                    unit = listwords_aft[0].replace(",", "").replace(")", "").replace("(", "").replace(".", "").strip()
                    if unit in units:
                        for i in range(len(ingredientwm[:positionfirst])):
                            if ingredientwm[i].isnumeric():
                                listwords_bfr = ingredientwm[i:positionfirst].split()
                                break
                        listwords_bfr = [ing.replace(',', '').replace(')', '').replace('(', '') for ing in listwords_bfr]
                        
                        if len(listwords_bfr) > 0:
                            value = 0


                            if len(listwords_bfr) == 3:
                                if (listwords_bfr[0].isnumeric() or (listwords_bfr[0] in weird_values.keys())) and (listwords_bfr[2].isnumeric() or (listwords_bfr[2] in weird_values.keys())) and (not listwords_bfr[1].isnumeric()):
                                    if listwords_bfr[1] in units:
                                        unit = listwords_bfr[1]
                                    value = weird_values[listwords_bfr[0]] if listwords_bfr[0] in weird_values.keys() else float(listwords_bfr[0])

                            elif len(listwords_bfr) == 2:
                                if listwords_bfr[0].isnumeric() and (listwords_bfr[1] in weird_values.keys()): 
                                    value = float(listwords_bfr[0]) + weird_values[listwords_bfr[1]]
                                if listwords_bfr[1].isnumeric() and (listwords_bfr[0] in weird_values.keys()): 
                                    value = float(listwords_bfr[1]) * weird_values[listwords_bfr[0]]
                                if listwords_bfr[1].isnumeric() and listwords_bfr[0].isnumeric():
                                    value = float(listwords_bfr[1]) * float(listwords_bfr[0])

                            else:
                                if listwords_bfr[0].isnumeric() or (listwords_bfr[0] in weird_values.keys()):
                                    value = weird_values[listwords_bfr[0]] if listwords_bfr[0] in weird_values.keys() else float(listwords_bfr[0])
                                sauveur = list(set(listwords_bfr) & set(units))
                                if len(sauveur) > 0:
                                    unit = sauveur[0] 
                            if value > 0:
                                response['unit'] = unit
                                response['value'] = value
                                response['valueingram'] = unitstogram[response['unit']] * value * CatWeighRatio[ingsData[[ingd['name'] for ingd in ingsData].index(ing)]['Category']]
                                measured = True

                    elif (ing == unit or ing[0:-1] == unit or ing+'s' == unit) and (ing in unit_ing.keys()):
                        unit_value = unit_ing[ing]
                        nb_units = 0 

                        for i in range(len(ingredientwm[:positionfirst])):
                            if ingredientwm[i].isnumeric():
                                listwords_bfr = ingredientwm[i:positionfirst].split()
                                break

                        listwords_bfr = [ing.replace(',', '').replace(')', '').replace('(', '') for ing in listwords_bfr]
                        if listwords_bfr[0].isnumeric() or (listwords_bfr[0] in weird_values.keys()):
                            nb_units = weird_values[listwords_bfr[0]] if listwords_bfr[0] in weird_values.keys() else float(listwords_bfr[0])

                        if nb_units > 0:
                                response['unit'] = "units"
                                response['value'] = nb_units
                                response['valueingram'] = nb_units * unit_value
                                measured = True

            break

    value_str = []
    

    if 'presentedstring' in list(response.keys()):
        value_str.append("'{}'")

    if 'unit' in list(response.keys()):
        value_str.append("'{}'")

    if 'value' in list(response.keys()):
        value_str.append("{}")

    if 'valueingram' in list(response.keys()):
        value_str.append("{}")

    namestr = ' , '.join(list(response.keys()))
    responsestr = (' , '.join(value_str)).format(*list(response.values()))

    if len(response.keys()) > 0:
        namestr = ',' + namestr
        responsestr = ',' + responsestr

    return {'names':namestr, 'values':responsestr}, measured



def getlastint(string):
    result = 0 
    new_string = string[::-1]
    for i in range(len(new_string)):
        try:
            result += int(new_string[i])*(10**i)
        except:
            break
    return result
      


def cookingTime(directions):
    mins = ['mins', 'min', 'minutes', 'minutes']
    hours = ['hrs', 'hours', 'hour']
    cumul = [0]
    for direction in [d.lower() for d in directions]:
        for str_time in mins:
            min_pos = direction.find(' {}'.format(str_time))
            if min_pos > 0:
                m = getlastint(direction[:min_pos])
                if m != 0:
                    cumul.append(m)
                    break
        for str_time in hours:
            hr_pos = direction.find(' {}'.format(str_time))
            if hr_pos > 0:
                h = getlastint(direction[:hr_pos])
                if h != 0:
                    cumul.append(h*60)
                    break
    return sum(cumul)

 
with open('recipeUpgraded.json') as f:
    data = json.load(f)
 

dic_ing = {} 
i = 318693
steps = 100

elements_ing = []
elements_ing = list(data)

elements = []



con = psycopg2.connect(DATABASE_URL)

curs_obj = con.cursor()



bar = Bar('Processing M-M', max=len(elements_ing)) 

def liststr2str(l):
    return (("'{}',"*len(l))[:-1]).format(*[appostrophe_thing(i) for i in l])
  
for element in elements_ing:

    if element['title'] == None:
        continue

    element['NER'] = list(set(element['NER']))

    sum_measured = 0.0

    for ing in element['NER']:
        measurements, measured = measurementgen(ing, element['ingredients'])

        if measured:
            sum_measured += 1.0

        namesSql = measurements['names']
        valuesSql = measurements['values']

        insert_str = "'{}', '{}'".format(str(element['_id']['$oid']), appostrophe_thing(ing))
        execute_string = f'''INSERT INTO "cosinaschema2"."IngredientsOnRecipes"(recipeid, ingid''' + namesSql + f''') VALUES(''' + insert_str + valuesSql + f''');'''


        try:
            curs_obj.execute(execute_string)
        except Exception as e :
            con.rollback()
            

    if len(element['NER']) == 0 or not (sum_measured/float(len(element['NER'])) >= .9):
        con.rollback()
        execute_string = f'''DELETE FROM "cosinaschema2"."Recipe" WHERE recipe_id = {f"'{str(element['_id']['$oid'])}'"};'''

        curs_obj.execute(execute_string)
    
    con.commit()
    bar.next()


print("")

import pandas as pd
import statsmodels.api as sm
from statsmodels.formula.api import ols

# Set the pathway to your excel file here and specify what sheet
data = pd.read_excel('C:/Users/chris/Desktop/anova_measures_filtered.xlsx', sheet_name='Blad1')

model = ols('PLT ~ C(Ramverk) * C(Dataset)', data=data).fit()
anova_table = sm.stats.anova_lm(model, typ=2)

print(anova_table)
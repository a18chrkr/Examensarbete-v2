# This script was used in PyCharm together
# with the packages pandas and statsmodels
# 
# To install the packages on your computer
# seperately, you can do so here:
# Pandas: https://pandas.pydata.org/
# Statsmodels: https://github.com/statsmodels/statsmodels/
# 
# The script reads a sheet of excel an file and do
# an ANOVA based on the columns PLT, Ramverk and Dataset
#

import pandas as pd
import statsmodels.api as sm
from statsmodels.formula.api import ols

# Set the pathway to your excel file here and specify what sheet
data = pd.read_excel('C:/Users/chris/Desktop/anova_measures_filtered.xlsx', sheet_name='Blad1')

model = ols('PLT ~ C(Ramverk) * C(Dataset)', data=data).fit()
anova_table = sm.stats.anova_lm(model, typ=2)

print(anova_table)
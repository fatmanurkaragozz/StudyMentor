# Fixtures / datasets

## `duolingo_sample_50k.csv` (not in the repo)

This is a 50k-row sample of the **Duolingo SLAM (Second Language Acquisition Modeling)**
dataset. It is **not committed** because that dataset is released for
non-commercial research use only and cannot be redistributed under this repo's
MIT license.

It is only referenced by the "Ek: Neden Duolingo Veri Setinden Vazgeçtik"
(Appendix: Why we dropped the Duolingo dataset) section of
[`../notebooks/spaced_repetition_eda.ipynb`](../notebooks/spaced_repetition_eda.ipynb).
The notebook's saved outputs already contain the conclusion, so you do **not**
need this file to read the analysis — only to re-run that appendix.

To re-run it:

1. Download the SLAM 2018 data from <https://sharedtask.duolingo.com/2018.html>
2. Take a sample and save it as `duolingo_sample_50k.csv` in this folder.

## ASSISTments sample

`../assistments_sample_100k.csv` is a sample of the public ASSISTments
2009–2010 "skill builder" dataset, used as the active training set. See the
methodology report in `Documents/ML_Metodoloji_ve_Sonuclar_Raporu.md`.

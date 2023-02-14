import { Datasets, train_test_split } from 'scikit-learn'
import { trainTestSplit } from 'train-test-split';

// Import DataFrame from pandas library
import IrisDataset from 'ml-dataset-iris'
import { DataFrame } from 'pandas';
import { RandomForestClassifier as RFClassifier } from 'ml-random-forest';

export class TlPredictor {
    classifier: RFClassifier
    trainingSet: number[][]
    predictions: number[]
    constructor() {
        this.trainingSet = IrisDataset.getNumbers()
        this.predictions = IrisDataset.getClasses().map((elem) =>
            IrisDataset.getDistinctClasses().indexOf(elem)
        )
        const options = {
            seed: 3,
            maxFeatures: 0.8,
            replacement: true,
            nEstimators: 25
        }
        const classifier = new RFClassifier(options);
    }

    train() {
        this.classifier.train(this.trainingSet, this.predictions);
    }

    predict() {
        return this.classifier.predict(this.trainingSet);
    }

    predictOOB() {
        return
        this.classifier.predictOOB();
    }

    confusionMatrix() {
        return this.classifier.getConfusionMatrix();

    }

    store() {

    }

    restore() {

    }

}

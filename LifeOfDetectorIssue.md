1. After a detector is developed, a verification process will start. At this stage, the verifier should create a new issue with default labels and `Detector` label. The subject of the issue should be in format of `XXNNNN detector_name`.

2. The verifier verifies if the detector can detect compatibility issues accurately, and record the details of the verification.

3. If the verifier finds no false-positive or false-negative, change the status of the issue to `Verified` and exit this process.

4. The verifier adds `False-Positive` and/or `False-Negative` labels to the issue if the detector is proved to have false-positives and/or false-negatives respectively.

5. The verifier can assign the issue to an appropriate detector developer or a developer can also pick the issue.

6. The developer takes one of the following actions:

  * modify code to fix the issue and change the issue status to `Fixed`. The developer should refer the issue number in the comments of the code change;
  * decide not to resolve the issue if the fix is too difficult and change the issue status to `Wontfix`;
  * confirm that the reported problems are not real problems and change the issue status to `Invalid`.

7. For a `Fixed` issue, the verifier verifies again and removes the `False-Positive` and `False-Negative` labels if the issue is verified not to have the corresponding problems. New labels should be added if new problems found. If all false-positives and false-negatives are fixed, the verifier changes the issue status to `Verified`, otherwise reopens the issue to `Assigned` status and the process goes to 5.

8. For a `Wontfix` or `Invalid` issue, anyone can argue and may reopen the issue to `Assigned` status and the process goes to 5.
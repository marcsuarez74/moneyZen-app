import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { UserFinancialData } from '../../../../models/budget.model';

@Component({
  selector: 'app-edit-income-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSliderModule
  ],
  templateUrl: './edit-income-dialog.component.html',
  styleUrls: ['./edit-income-dialog.component.scss']
})
export class EditIncomeDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditIncomeDialogComponent>);
  
  readonly data = inject<{ userData: UserFinancialData | null }>(MAT_DIALOG_DATA);
  
  readonly incomeForm: FormGroup = this.fb.group({
    salary: [this.data?.userData?.salary || 0, [Validators.required, Validators.min(0)]],
    accountBalance: [this.data?.userData?.accountBalance || 0, Validators.required],
    isPositiveBalance: [this.data?.userData?.isPositiveBalance ?? true],
    paydayDay: [this.data?.userData?.paydayDay || 1, [Validators.required, Validators.min(1), Validators.max(31)]]
  });
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSave(): void {
    if (this.incomeForm.valid) {
      const result: UserFinancialData = {
        salary: this.incomeForm.value.salary,
        accountBalance: this.incomeForm.value.accountBalance,
        isPositiveBalance: this.incomeForm.value.isPositiveBalance,
        paydayDay: this.incomeForm.value.paydayDay
      };
      this.dialogRef.close(result);
    }
  }
}
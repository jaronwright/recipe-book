import { RecipesComponent } from './../recipes.component';
import { Component,
         OnInit,
         OnDestroy } from '@angular/core';
import { FormArray,
         FormGroup,
         FormControl,
         Validators,
         FormBuilder } from '@angular/forms';
import { ActivatedRoute,
         Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { RecipeService } from './../recipe.service';
import { Recipe } from '../recipe';

@Component({
  selector: 'rb-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styles: [``]
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  recipeForm: FormGroup;
  private recipeIndex: number;
  private recipe: Recipe;
  private isNew = true;
  private mySubscription: Subscription;

  constructor(private myRoute: ActivatedRoute,
              private myRecipeService: RecipeService,
              private myFormBuilder: FormBuilder,
              private myRouter: Router) { }

  ngOnInit() {
    this.mySubscription = this.myRoute.params.subscribe(
      //the + converts the string into a number
      (params: any) => {
        if (params.hasOwnProperty('id')) {
          this.isNew = false;
          this.recipeIndex = +params['id'];
          this.recipe = this.myRecipeService.getRecipe(this.recipeIndex);
        } else {
          this.isNew = true;
          this.recipe = null;
        }
        this.initForm();
        console.log(this.isNew)
      }
    )
  }

  onSubmit(){
    const newRecipe = this.recipeForm.value;
    if(this.isNew){
      this.myRecipeService.addRecipe(newRecipe);
    } else {
      this.myRecipeService.editRecipe(this.recipe, newRecipe)
    }
    this.navigateBack();
  }

  onCancel(){
    this.navigateBack();
  }

  onAddItem(name: string, amount: string) {
    (<FormArray>this.recipeForm.controls['ingredients']).push(
      new FormGroup({
        name: new FormControl(name, Validators.required),
        amount: new FormControl(amount, [
          Validators.required,
          Validators.pattern("\\d+")
        ])
      })
    );
  }

  onRemoveItem(index: number){
    //type casting
    (<FormArray>this.recipeForm.controls['ingredients']).removeAt(index);
  }

  ngOnDestroy(){
    this.mySubscription.unsubscribe();
  }

  private navigateBack(){
    this.myRouter.navigate(['../']);
  }

  private initForm(){
    let recipeName = '';
    let recipeImageUrl = '';
    let recipeContent = '';
    let recipeIngredients: FormArray = new FormArray([]);

    if(!this.isNew){
      if(this.recipe.hasOwnProperty('ingredients')){
        for (let i = 0; i < this.recipe.ingredients.length; i++){
          recipeIngredients.push(
            new FormGroup({
              name: new FormControl(this.recipe.ingredients[i].name, Validators.required),
              amount: new FormControl(this.recipe.ingredients[i].amount, [
                Validators.required,
                Validators.pattern("\\d+")
              ])
            })
          );
        }
      }
      recipeName = this.recipe.name;
      recipeImageUrl = this.recipe.imagePath;
      recipeContent = this.recipe.description;
    }
    this.recipeForm = this.myFormBuilder.group({
      name: [recipeName, Validators.required],
      imagePath: [recipeImageUrl, Validators.required],
      description: [recipeContent, Validators.required],
      ingredients: recipeIngredients
    });
  }
}

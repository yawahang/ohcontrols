import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'oh-rating-picker',
  templateUrl: './oh-rating-picker.component.html',
  styleUrls: ['./oh-rating-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class OHRatingPickerComponent implements OnInit {

  @Output() valueChange = new EventEmitter<any>();

  ratings: number[] = [];
  starsCount: number;
  tempValue: number;
  defaultValue: number;
  colors: string[];
  allowHalf: boolean;
  returnDefaultValue: boolean;
  orientation: string;
  iconType: string;

  fullRatingIcon: string;
  halfRatingIcon: string;
  emptyRatingIcon: string;
  ratingType: string;

  stars: MvStarsConfig[];

  @Input('config') set config(prop: MvPickerConfig) {

    if (prop) {

      this.stars = [];
      this.ratings = [];
      this.starsCount = prop.starsCount != null ? prop.starsCount : 6;
      this.defaultValue = prop.defaultValue != null ? prop.defaultValue : 0;
      this.tempValue = prop.defaultValue != null ? prop.defaultValue : 0;
      this.colors = prop.starsColors != null ? prop.starsColors.split(',') : ['#fbbc04'];
      this.allowHalf = prop.allowHalf != null ? prop.allowHalf : false;
      this.returnDefaultValue = prop.returnDefaultValue != null ? prop.returnDefaultValue : false;
      this.orientation = prop.orientation != null ? prop.orientation : 'horizontal';

      this.fullRatingIcon = prop.fullRatingIcon != null ? prop.fullRatingIcon : 'star';
      this.halfRatingIcon = prop.halfRatingIcon != null ? prop.halfRatingIcon : 'star_half';
      this.emptyRatingIcon = prop.emptyRatingIcon != null ? prop.emptyRatingIcon : 'star_bordered';
      this.ratingType = prop.ratingType != null ? prop.ratingType : 'mat-icon';

      if (this.ratingType === 'mat-icon') {

        this.reDrawStars();
      } else {

        for (let i = this.starsCount; i >= 1; i--) {
          this.ratings.push(i);
        }
      }

      this.valueChange.emit(this.defaultValue);
    }
  }

  constructor() {
  }

  ngOnInit() {

  }

  reDrawStars() {

    const dvIsDecimal = this.defaultValue.toString().includes('.');
    const dv = Number(this.defaultValue.toString().split('.')[0]);

    let checkedType: string;

    let star: MvStarsConfig = {} as MvStarsConfig;
    const starTmp: MvStarsConfig[] = [];

    for (let index = 1; index <= this.starsCount; index++) {

      star.value = index;
      star.index = index - 1;

      checkedType = index <= dv ? this.fullRatingIcon : (dvIsDecimal && index === (dv + 1) && this.allowHalf) ?
        this.halfRatingIcon : this.emptyRatingIcon;
      star.icon = checkedType;
      star.color = this.colors[index - 1] ? this.colors[index - 1] : this.colors[0];
      star.checked = checkedType === 'checked' ? true : false;
      star.isHalf = checkedType === this.halfRatingIcon ? true : false;
      starTmp.push(star);
      star = {} as MvStarsConfig;
    }

    this.stars = [...starTmp];

    if (this.returnDefaultValue) {
      this.calculateValue();
    }
  }

  calculateValue() {

    const checkedStars = this.stars.filter(s => (s.checked));

    if (checkedStars[checkedStars.length - 1]) {

      if (checkedStars[checkedStars.length - 1].isHalf && this.allowHalf) {
        this.tempValue = checkedStars[checkedStars.length - 1].value - 0.5;
      } else {
        this.tempValue = checkedStars[checkedStars.length - 1].value;
      }
    }

    this.valueChange.emit(this.tempValue);
  }

  onStarHover(star: MvStarsConfig) {

    if (star) {

      this.setStarProperty(star);
    }
  }

  onStarLeave(star: MvStarsConfig) {

    this.reDrawStars();
  }

  onStarClick(star: MvStarsConfig) {

    if (star) {

      this.setStarProperty(star);
    }
  }

  setStarProperty(star: MvStarsConfig) {

    if (star.icon === this.fullRatingIcon) {

      star.icon = this.allowHalf ? this.halfRatingIcon : this.emptyRatingIcon;
      star.checked = true;
      star.isHalf = this.allowHalf ? true : false;

    } else if (star.icon === this.halfRatingIcon) {

      star.icon = this.fullRatingIcon;
      star.checked = true;
      star.isHalf = false;

    } else if (star.icon === this.emptyRatingIcon) {

      star.icon = this.allowHalf ? this.halfRatingIcon : this.fullRatingIcon;
      star.checked = true;
      star.isHalf = this.allowHalf ? true : false;
    }

    this.walkThroughStars(star.index);
  }

  walkThroughStars(currentIndex: number) {

    for (let index = 0; index < this.stars.length; index++) {

      if (currentIndex === 0) {

        this.stars[index].icon = this.emptyRatingIcon;
        this.stars[index].checked = false;
        this.stars[index].isHalf = false;

      } else {

        if (index < currentIndex) {

          this.stars[index].icon = this.fullRatingIcon;
          this.stars[index].checked = true;
          this.stars[index].isHalf = false;

        } else if (index > currentIndex) {

          this.stars[index].icon = this.emptyRatingIcon;
          this.stars[index].checked = false;
          this.stars[index].isHalf = false;
        }
      }

      if (index === this.stars.length - 1) {
        this.calculateValue();
      }
    }
  }

  onCssStarClick(rating: number) {

    this.tempValue = rating;
    this.valueChange.emit(this.tempValue);
  }
}

export interface MvPickerConfig {
  starsCount: number;
  defaultValue: number;
  returnDefaultValue: boolean;
  allowHalf: boolean;
  starsColors: string;
  orientation: string;
  fullRatingIcon: string;
  halfRatingIcon: string;
  emptyRatingIcon: string;
  ratingType: string;
}

export interface MvStarsConfig {
  value: number;
  index: number;
  icon: string;
  color: string;
  checked: boolean;
  isHalf: boolean;
}

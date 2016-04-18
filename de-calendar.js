//Календарь
var calendar;
//Перечисление месяцев
var months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

function init()
{
	calendar = new UICalendar(".b-page-calendar","date",true);
}

window.onload = init;
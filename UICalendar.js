/**
 * Создает экземпляр нового виджета календарь
 * @param {String} jquerySelector - css селектор DOM элемента, внутри которого расположится календарь
 * @param startYear - год отображения
 * @param startMonth - месяц отображения
 * @constructor
 * @attribute target - целевой JQuery объект
 * @attribute targetSelector - заданный селектор
 * @attribute events - ассоциативный массив событий
 * @attribute firstMonthDate - отображаемая дата (год\месяц)
 * @attribute dateRange - выбранные даты
 * @attribute calendar - текущий календарь (месяцев,годов, дат)
 */
function UICalendar(jquerySelector, calendarType, autoSwitch, startYear, startMonth) {
    this.target = $(jquerySelector);
    this.targetSelector = jquerySelector;
	this.events = [];
	this.mounth = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
	this.calendar;
	this.daysDiv = $('<div class="ui-calendar-margin ui-calendar-padding"></div>');
	this.firstMonthDate = new Date();
	this.firstMonthDate.setDate(1);
	this.autoSwitch = autoSwitch;
	this.calendarListDiv = $("<div></div>");
	this.dateRange;
	this.init();
	
    switch (calendarType)
    {
	    case "month": this.calendar = new UICalendarMonthProvider(this);
		        break;
	    case "year": this.calendar = new UICalendarYearProvider(this);
		    break;
	    default ://"date"
		    this.calendar = new UICalendarDateProvider(this);
		    break;
    }
}
/**
 * Инициализация блока календаря (верхняя полоса, блоки)
 */
UICalendar.prototype.init = function ()
{
	//Верхний блок
	var calendar = $("<div class='ui-calendar-font ui-calendar-div'></div>");
	var calendarHead = $("<div class='ui-calendar-head ui-calendar-margin'></div>");
	var leftSpan = $("<div class='ui-calendar-cursor ui-calendar-move ui-calendar-move__left left-side'></div>");
	var rightSpan = $("<div class='ui-calendar-cursor ui-calendar-move ui-calendar-move__right left-side'></div>");
	this.dateRange = this.autoSwitch?$("<div class='ui-calendar-daterange ui-calendar-daterange-clickable left-side'></div>"):$("<div class='ui-calendar-daterange left-side'></div>");
	var today =   $("<div class='ui-calendar-cursor ui-calendar-today__button left-side'>Сегодня</div>");


	calendarHead.append(leftSpan, this.dateRange, rightSpan, today,$("<div class=ui-calendar-clear></div>"));

	calendar.append(calendarHead);
	this.target.append(calendar);

	var currentObject = this;

	//Реакция на переключение (влево вправо)
	leftSpan.bind("click", function () {

		currentObject.calendar.move(-1);
	});
	rightSpan.bind("click", function () {
		currentObject.calendar.move(1);
	});


	this.daysDiv.append(this.calendarListDiv);
	calendar.append(this.daysDiv);

	var thisObject = this;
	today.bind("click keypress",function()
	{
		thisObject.firstMonthDate = new Date();
		thisObject.firstMonthDate.setDate(1);
		thisObject.calendar = new UICalendarDateProvider(thisObject);

		thisObject.calendar.initValues();
	});

};

/**
 * Задает месяц для отображения
 * @param month - месяц, необходимый для отображения
 */
UICalendar.prototype.setMonth = function(month)
{
	this.firstMonthDate.setMonth(month);
	this.calendar.initValues();
};

/**
 * Задает год для отображения
 * @param year
 */
UICalendar.prototype.setYear = function(year)
{
	this.firstMonthDate.setYear(year);
	this.calendar.initValues();
} ;

/**
 * Расширение даты - получает количество дней в месяце
 * @returns {number}
 */
Date.prototype.getDaysInMonth = function () {
	return (new Date(this.getFullYear(), this.getMonth() + 1, 0)).getDate();
};

function UICalendarProvider()
{
	this.move = function(direction){};
	this.initValues = function(){};
};

/**
 * Выбор даты (интервал в месяц)
 * @param UICalendarItem - экземпляр календаря
 * @constructor
 */
function UICalendarDateProvider(UICalendarItem)
{
	this.UICalendarItem = UICalendarItem;

	this.UICalendarItem.daysDiv.html("");
	this.UICalendarItem.daysDiv.append(this.UICalendarItem.weekDescription);
	this.UICalendarItem.daysDiv.append(this.UICalendarItem.calendarListDiv);

	var currentObject = UICalendarItem;
	/**
	 * При нажатии на верхний интервал - переход в выборке более объемной (с даты на месяц, с месяца на год)
	 * при включенном autoSwitch
	 */
	$(".ui-calendar-daterange-clickable").bind("click keypress",function()
	{
		currentObject.selectedDates = [];
		currentObject.calendar = new UICalendarMonthProvider(currentObject);
		currentObject.calendar.initValues();
	});

	/**
	 * Переход на другой месяц
	 * @param {Number} direction - направление переход (-1 - предыдущий, 1 - следующий)
	 */
	this.move = function(direction)
	{
		this.UICalendarItem.selectedDates = [];
		this.UICalendarItem.firstMonthDate.setMonth(this.UICalendarItem.firstMonthDate.getMonth()+direction);
		this.initValues()
	}

	/**
	 * Инициализация месяца. Установка отображения чисел и названия месяца
	 */
	this.initValues = function()
	{
		this.UICalendarItem.calendarListDiv.html("");
		var daysList = '<ol class="ui-calendar-list-mounth ui-calendar-list ui-calendar-list-up ui-calendar-font-white-color ui-calendar-text-left-side">';
		var startMonthDay = this.UICalendarItem.firstMonthDate;
		this.UICalendarItem.dateRange.html(this.UICalendarItem.mounth[this.UICalendarItem.firstMonthDate.getMonth()] + ' ' + this.UICalendarItem.firstMonthDate.getFullYear());

		//Вычисляем день недели = началу месяца
		var startIndex = startMonthDay.getDay() - 1;
		if (startIndex < 0) startIndex = 6;

		//Количество дней в предыдущем месяце
		var monthBefore = new Date(startMonthDay.getFullYear(),startMonthDay.getMonth(),startMonthDay.getDate());
		monthBefore.setMonth(monthBefore.getMonth()-1);
		var dayInMonthBefore = monthBefore.getDaysInMonth();

		var weekDescriptions = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"]
		var weekIndex = 0;
		//Предыдущий месяц
		for (var i = 0; i < startIndex; i++) {
			daysList += "<li class='left-side ui-calendar-list-item ui-calendar-list-item-width ui-calendar-cursor ui-calendar-selectable ui-calendar-month-control ui-calendar-prev-month'>"+weekDescriptions[weekIndex++]+", "+(dayInMonthBefore-startIndex+i+1)+"</li>";
		}
		//Текущий месяц
		var today = new Date();
		for (var i = 0; i < startMonthDay.getDaysInMonth() ; i++) {
			var currentEvents = this.UICalendarItem.getEvents(new Date(startMonthDay.getFullYear(),startMonthDay.getMonth(),i+1));
			var str = (weekIndex<7?(weekDescriptions[weekIndex++]+", "):"")+(i+1);


				if (currentEvents)
				{    //Событие и день = сегодня
					if (today.getFullYear() == startMonthDay.getFullYear() && today.getMonth() == startMonthDay.getMonth() && today.getDate() == i+1)
						daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width ui-calendar-events ui-calendar-today'>"+str+"" +
							"<div class='ui-calendar-event__text'><div class='ui-calendar-event__title'>"+currentEvents[0].title+"</div>"+currentEvents[0].part+"</div></li>";
					else  //просто событие
						daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width ui-calendar-events'>"+str+"" +
							"<div class='ui-calendar-event__text'><div class='ui-calendar-event__title'>"+currentEvents[0].title+"</div>"+currentEvents[0].part+"</div></li>";
				}
				else //Сегодня
					if (today.getFullYear() == startMonthDay.getFullYear() && today.getMonth() == startMonthDay.getMonth() && today.getDate() == i+1)
					{
						daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width ui-calendar-today'>"+str+"</li>";
					} else  //самый обычный день
						daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width'>"+str+"</li>";

		}
		//Заполним окончание недели следующим месяцем
		var lastsDaysInWeek = 7 - (startMonthDay.getDaysInMonth() - (7- startIndex))%7;

		if (lastsDaysInWeek < 7)
			for (var i = 0; i < lastsDaysInWeek ; i++) {
					daysList += "<li class='left-side ui-calendar-cursor ui-calendar-list-item  ui-calendar-selectable ui-calendar-list-item-width ui-calendar-month-control ui-calendar-next-month'>"+(i+1)+"</li>";
			}
		daysList += '</ol><div class=ui-calendar-clear></div>';
		this.UICalendarItem.calendarListDiv.append($(daysList));

		//замыкание - ссылку на себя
		var currentObject = this.UICalendarItem;
		/**
		 * Реакция на выбор даты. (выбор даты, сброс значений) Формирование массива выбранных дат
		 */
		$(this.UICalendarItem.targetSelector + " .ui-calendar-list-mounth li").bind("click",function(e)
		{
			currentObject.event = 1;

			if ($(this).hasClass("ui-calendar-month-control"))
			{
				if ($(this).hasClass("ui-calendar-prev-month"))
				{
					currentObject.calendar.move(-1);

				}
				else
					currentObject.calendar.move(1);
				return;
			}

			var selectedDate = new Date(currentObject.firstMonthDate.getFullYear(),currentObject.firstMonthDate.getMonth(), parseInt($(this).html()));

			currentObject.dateClick.call(this,currentObject,selectedDate,e);
		});
		
	}
}

UICalendarDateProvider.prototype = new UICalendarProvider();
UICalendarDateProvider.prototype.constructor = UICalendarDateProvider;
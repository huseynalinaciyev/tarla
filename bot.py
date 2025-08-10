from aiogram import Bot, Dispatcher, executor, types

API_TOKEN = '8301131318:AAGu1dgzjdm1e3_04guNum6Fyrr_qAg_eeo'

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

# Başlanğıc menyu (inline düymələr)
def main_menu():
    buttons = [
        [types.InlineKeyboardButton(text="Ekin əkmək 🌱", callback_data="ekin_ek"),
         types.InlineKeyboardButton(text="Suvarmaq 💧", callback_data="suvar")],
        [types.InlineKeyboardButton(text="Biçmək ✂️", callback_data="bic"),
         types.InlineKeyboardButton(text="Satmaq 💰", callback_data="sat")],
    ]
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=buttons)
    return keyboard

@dp.message_handler(commands=['start'])
async def send_welcome(message: types.Message):
    await message.answer(f"Salam, {message.from_user.first_name}! Xoş gəlmisən tarla oyununa! Nə etmək istəyirsən?", reply_markup=main_menu())

@dp.callback_query_handler(lambda c: c.data)
async def process_callback(callback_query: types.CallbackQuery):
    action = callback_query.data
    if action == "ekin_ek":
        await bot.answer_callback_query(callback_query.id)
        await bot.send_message(callback_query.from_user.id, "Ekin əkildi! 🌱")
    elif action == "suvar":
        await bot.answer_callback_query(callback_query.id)
        await bot.send_message(callback_query.from_user.id, "Tarlan suvarıldı! 💧")
    elif action == "bic":
        await bot.answer_callback_query(callback_query.id)
        await bot.send_message(callback_query.from_user.id, "Ekin biçildi! ✂️")
    elif action == "sat":
        await bot.answer_callback_query(callback_query.id)
        await bot.send_message(callback_query.from_user.id, "Məhsul satıldı! 💰")

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)

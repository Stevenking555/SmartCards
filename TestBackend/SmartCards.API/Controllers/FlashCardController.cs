using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCards.API.Data;
using SmartCards.API.Models;
using SmartCards.API.Services;

namespace SmartCards.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // URL: api/users
    public class FlashCardController : ControllerBase
    {
        public FlashCardController() { }

        [HttpGet]
        public ActionResult<List<FlashCard>> GetAll()
        {
            return FlashCardService.GetAll();
        }

        [HttpGet("get/{id}")]
        public ActionResult<FlashCard> Get(int id)
        {
            var result = FlashCardService.Get(id);

            if (result is null)
            {
                return NotFound();
            }
            return result;
        }

        [HttpPost]
        public IActionResult Create(FlashCard flashCard)
        {
            FlashCardService.Add(flashCard);
            return CreatedAtAction(nameof(Get), new { id = flashCard.Id }, flashCard);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, FlashCard flashCard)
        {
            if (id != flashCard.Id) return BadRequest("ID mismatch");

            var check = FlashCardService.Get(flashCard.Id);

            if (check is null)
            {
                return NotFound();
            }
            FlashCardService.Update(flashCard);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var check = FlashCardService.Get(id);

            if (check is null)
            {
                return NotFound();
            }
            FlashCardService.Delete(id);
            return NoContent();
        }
    }
}

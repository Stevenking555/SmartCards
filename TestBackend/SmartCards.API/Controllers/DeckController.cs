using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCards.API.Data;
using SmartCards.API.Models;
using SmartCards.API.Services;

namespace SmartCards.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // URL: api/users
    public class DeckController : ControllerBase
    {
        public DeckController() { }

        [HttpGet]
        public ActionResult<List<Deck>> GetAll()
        {
            return DeckService.GetAll();
        }

        [HttpGet("get/{id}")]
        public ActionResult<Deck> Get(int id)
        {
            var result = DeckService.Get(id);

            if (result is null)
            {
                return NotFound();
            }
            return result;
        }

        [HttpPost]
        public IActionResult Create(Deck deck)
        {
            DeckService.Add(deck);
            return CreatedAtAction(nameof(Get), new { id = deck.Id }, deck);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Deck deck)
        {
            if (id != deck.Id) return BadRequest("ID mismatch");

            var check = DeckService.Get(deck.Id);

            if (check is null)
            {
                return NotFound();
            }
            DeckService.Update(deck);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var check = DeckService.Get(id);

            if (check is null)
            {
                return NotFound();
            }
            DeckService.Delete(id);
            return NoContent();
        }
    }
}

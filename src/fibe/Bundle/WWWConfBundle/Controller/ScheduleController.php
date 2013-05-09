<?php 
namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
//On insere l'entity Event  de simple schedule
use IDCI\Bundle\SimpleScheduleBundle\Form\XPropertyType; 
use IDCI\Bundle\SimpleScheduleBundle\Form\EventType;
use IDCI\Bundle\SimpleScheduleBundle\Entity\XProperty; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\Event; 
//use fibe\Bundle\WWWConfBundle\Form\EventType; 
//On insere le controlleur de Event 
//use SimpleScheduleBundle\Controller
/**
 * Schedule Controller 
 *
 * @Route("/admin/schedule")
 */
class ScheduleController extends Controller
{

/**
 *  @Route("/", name="wwwconf_schedule")
 *  @Template()
 */
    public function scheduleAction()
    {
		 
		  $em = $this->getDoctrine()->getManager();
      $entities = $em->getRepository('IDCISimpleScheduleBundle:Event')->findAll();
      return  array(
        'events' => $entities,
      );
	
    }
    

    
}
